import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import type { Order, Proxy, ProxyPurchase, TopUp } from "@/lib/types"
import { ObjectId } from "mongodb"

async function findAvailableProxyForCallback(db: any, country: string, userId: ObjectId) {
  const userPurchases = await db
    .collection<ProxyPurchase>("purchases")
    .find({
      userId,
      expiresAt: { $gt: new Date() },
    })
    .toArray()

  const purchasedProxyIds = userPurchases.map((p: ProxyPurchase) => p.proxyId)

  const now = new Date()
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000)

  // First try fresh proxies (>6 hours expiry)
  const freshProxy = await db
    .collection<Proxy>("proxies")
    .find({
      country,
      isActive: true,
      expiresAt: { $gt: sixHoursFromNow },
      $expr: { $lt: ["$currentUsage", "$maxUsage"] },
      _id: { $nin: purchasedProxyIds },
    })
    .sort({ expiresAt: -1 })
    .limit(1)
    .toArray()

  if (freshProxy.length > 0) {
    return freshProxy[0]
  }

  // Fallback to any available
  const anyProxy = await db
    .collection<Proxy>("proxies")
    .find({
      country,
      isActive: true,
      expiresAt: { $gt: now },
      $expr: { $lt: ["$currentUsage", "$maxUsage"] },
      _id: { $nin: purchasedProxyIds },
    })
    .sort({ expiresAt: -1 })
    .limit(1)
    .toArray()

  return anyProxy.length > 0 ? anyProxy[0] : null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { Body } = body

    if (!Body?.stkCallback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = Body.stkCallback

    const db = await getDb()

    const order = await db.collection<Order>("orders").findOne({
      mpesaCheckoutRequestId: CheckoutRequestID,
    })

    const topUp = await db.collection<TopUp>("topups").findOne({
      mpesaCheckoutRequestId: CheckoutRequestID,
    })

    let receiptNumber = ""
    if (CallbackMetadata?.Item) {
      const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === "MpesaReceiptNumber")
      receiptNumber = receiptItem?.Value || ""
    }

    if (order) {
      if (ResultCode === 0) {
        const selectedProxy = await findAvailableProxyForCallback(db, order.country, order.userId)

        let proxy = null
        if (selectedProxy) {
          proxy = await db
            .collection<Proxy>("proxies")
            .findOneAndUpdate({ _id: selectedProxy._id }, { $inc: { currentUsage: 1 } }, { returnDocument: "after" })
        }

        if (proxy) {
          // Use the proxy's admin-set expiry date
          const expiresAt = proxy.expiresAt

          const purchase: ProxyPurchase = {
            _id: new ObjectId(),
            userId: order.userId,
            proxyId: proxy._id,
            orderId: order._id,
            proxy: {
              ip: proxy.ip,
              port: proxy.port,
              username: proxy.username,
              password: proxy.password,
              country: proxy.country,
              countryCode: proxy.countryCode,
            },
            expiresAt,
            purchasedAt: new Date(),
          }

          await db.collection<ProxyPurchase>("purchases").insertOne(purchase)

          if (proxy.currentUsage >= proxy.maxUsage) {
            await db.collection<Proxy>("proxies").updateOne({ _id: proxy._id }, { $set: { isActive: false } })
          }
        }

        await db.collection<Order>("orders").updateOne(
          { _id: order._id },
          {
            $set: {
              status: proxy ? "paid" : "failed",
              mpesaReceiptNumber: receiptNumber,
              paidAt: new Date(),
            },
          },
        )
      } else {
        await db.collection<Order>("orders").updateOne({ _id: order._id }, { $set: { status: "failed" } })
      }
    } else if (topUp) {
      // Handle top-up payment
      if (ResultCode === 0) {
        // Add balance to user
        await db.collection("users").updateOne({ _id: topUp.userId }, { $inc: { balance: topUp.amount } })

        await db.collection<TopUp>("topups").updateOne(
          { _id: topUp._id },
          {
            $set: {
              status: "completed",
              mpesaReceiptNumber: receiptNumber,
              completedAt: new Date(),
            },
          },
        )
      } else {
        await db.collection<TopUp>("topups").updateOne({ _id: topUp._id }, { $set: { status: "failed" } })
      }
    } else {
      // Handle email order payment
      const emailOrder = await db.collection("emailOrders").findOne({
        mpesaCheckoutRequestId: CheckoutRequestID,
      })

      if (emailOrder) {
        if (ResultCode === 0) {
          // Get available emails for the domain
          const availableEmails = await db
            .collection("emails")
            .find({
              domainId: emailOrder.domainId,
              status: "available",
            })
            .limit(emailOrder.quantity)
            .toArray()

          if (availableEmails.length >= emailOrder.quantity) {
            // Mark emails as sold
            const emailIds = availableEmails.map((e) => e._id)
            await db.collection("emails").updateMany(
              { _id: { $in: emailIds } },
              { $set: { status: "sold" } }
            )

            // Create email purchase record
            await db.collection("emailPurchases").insertOne({
              userId: emailOrder.userId,
              orderId: emailOrder._id,
              emails: availableEmails.map((e) => ({
                emailAddress: e.emailAddress,
                password: e.password,
                domain: e.domain,
                server: e.server,
              })),
              quantity: emailOrder.quantity,
              domain: emailOrder.domain,
              totalPrice: emailOrder.totalPrice,
              purchasedAt: new Date(),
            })

            // Mark order as paid
            await db.collection("emailOrders").updateOne(
              { _id: emailOrder._id },
              {
                $set: {
                  status: "paid",
                  mpesaReceiptNumber: receiptNumber,
                  paidAt: new Date(),
                },
              },
            )
          } else {
            // Not enough emails available
            await db.collection("emailOrders").updateOne(
              { _id: emailOrder._id },
              { $set: { status: "failed" } }
            )
          }
        } else {
          await db.collection("emailOrders").updateOne({ _id: emailOrder._id }, { $set: { status: "failed" } })
        }
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
  }
}
