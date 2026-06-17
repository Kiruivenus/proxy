import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"
import type { Db } from "mongodb"
import { ObjectId } from "mongodb"
import type { Order, Proxy, ProxyPurchase, TopUp } from "@/lib/types"

async function getMpesaAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")

  const response = await fetch("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  const data = await response.json()
  return data.access_token
}

async function findAvailableProxyForCallback(db: Db, country: string, userId: ObjectId) {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const checkoutRequestId = searchParams.get("checkoutRequestId")
    const type = searchParams.get("type") // "topup", "proxy", "email"

    if (!checkoutRequestId) {
      return NextResponse.json({ error: "Checkout Request ID is required" }, { status: 400 })
    }

    const db = await getDb()

    // 1. Check if the database is already updated
    let order = null
    let topUp = null
    let emailOrder = null

    if (type === "topup") {
      topUp = await db.collection<TopUp>("topups").findOne({
        mpesaCheckoutRequestId: checkoutRequestId
      })
      if (topUp && topUp.status !== "pending") {
        return NextResponse.json({
          status: topUp.status === "processing_payment" ? "pending" : topUp.status,
          receiptNumber: topUp.mpesaReceiptNumber
        })
      }
    } else if (type === "proxy") {
      order = await db.collection<Order>("orders").findOne({
        mpesaCheckoutRequestId: checkoutRequestId
      })
      if (order && order.status !== "pending") {
        return NextResponse.json({
          status: order.status === "processing_payment" ? "pending" : order.status,
          receiptNumber: order.mpesaReceiptNumber
        })
      }
    } else if (type === "email") {
      emailOrder = await db.collection("emailOrders").findOne({
        mpesaCheckoutRequestId: checkoutRequestId
      })
      if (emailOrder && emailOrder.status !== "pending") {
        return NextResponse.json({
          status: emailOrder.status === "processing_payment" ? "pending" : emailOrder.status,
          receiptNumber: emailOrder.mpesaReceiptNumber
        })
      }
    }

    // 2. If it is still pending, query Safaricom's API directly
    try {
      console.log(`Querying Safaricom for CheckoutRequestID: ${checkoutRequestId}`)
      const accessToken = await getMpesaAccessToken()
      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14)
      const shortcode = process.env.MPESA_SHORTCODE
      const passkey = process.env.MPESA_PASSKEY
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64")

      const queryResponse = await fetch("https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        }),
      })

      if (!queryResponse.ok) {
        console.error(`Safaricom query status failed with HTTP ${queryResponse.status}`);
        return NextResponse.json({ status: "pending" })
      }

      const stkData = await queryResponse.json()
      console.log("Safaricom STK Query Response:", JSON.stringify(stkData, null, 2))

      const resultCode = stkData.ResultCode !== undefined ? Number(stkData.ResultCode) : null
      const resultDesc = stkData.ResultDesc || stkData.ResponseDescription || stkData.errorMessage || "Transaction Status Query Failed"
      const receiptNumber = "QUERY_" + checkoutRequestId.slice(-8).toUpperCase()

      // Check if the transaction is still processing/pending
      const isProcessing = 
        (stkData.errorMessage && typeof stkData.errorMessage === "string" && stkData.errorMessage.toLowerCase().includes("processing")) ||
        (stkData.ResponseDescription && typeof stkData.ResponseDescription === "string" && stkData.ResponseDescription.toLowerCase().includes("processing")) ||
        (stkData.ResultDesc && typeof stkData.ResultDesc === "string" && stkData.ResultDesc.toLowerCase().includes("processing")) ||
        stkData.errorCode === "500.002.01" ||
        stkData.errorCode === "400.002.02" ||
        stkData.ResponseCode === "103"

      if (isProcessing) {
        return NextResponse.json({ status: "pending" })
      }


      if (resultCode === 0) {
        // Payment Successful
        if (type === "topup" && topUp) {
          const lockResult = await db.collection<TopUp>("topups").updateOne(
            { _id: topUp._id, status: { $nin: ["completed", "processing_payment"] } },
            { $set: { status: "processing_payment" } }
          )

          if (lockResult.modifiedCount === 0) {
            const dbTopUp = await db.collection<TopUp>("topups").findOne({ _id: topUp._id })
            return NextResponse.json({
              status: dbTopUp?.status === "processing_payment" ? "pending" : dbTopUp?.status,
              receiptNumber: dbTopUp?.mpesaReceiptNumber
            })
          }

          await db.collection("users").updateOne({ _id: topUp.userId }, { $inc: { balance: topUp.amount } })
          await db.collection<TopUp>("topups").updateOne(
            { _id: topUp._id },
            {
              $set: {
                status: "completed",
                mpesaReceiptNumber: receiptNumber,
                completedAt: new Date(),
              },
            }
          )
          return NextResponse.json({ status: "completed", receiptNumber })
        } 
        
        else if (type === "proxy" && order) {
          const lockResult = await db.collection<Order>("orders").updateOne(
            { _id: order._id, status: { $nin: ["paid", "completed", "processing_payment"] } },
            { $set: { status: "processing_payment" } }
          )

          if (lockResult.modifiedCount === 0) {
            const dbOrder = await db.collection<Order>("orders").findOne({ _id: order._id })
            return NextResponse.json({
              status: dbOrder?.status === "processing_payment" ? "pending" : dbOrder?.status,
              receiptNumber: dbOrder?.mpesaReceiptNumber
            })
          }

          // Double check database status to avoid race conditions with callback
          const dbOrder = await db.collection<Order>("orders").findOne({ _id: order._id })
          if (dbOrder && dbOrder.status === "paid") {
            return NextResponse.json({ status: "paid", receiptNumber: dbOrder.mpesaReceiptNumber })
          }

          // Check if a purchase already exists for this order (callback completed first)
          const existingPurchase = await db.collection<ProxyPurchase>("purchases").findOne({ orderId: order._id })
          if (existingPurchase) {
            await db.collection<Order>("orders").updateOne(
              { _id: order._id },
              { $set: { status: "paid", mpesaReceiptNumber: receiptNumber, paidAt: new Date() } }
            )
            return NextResponse.json({ status: "paid", receiptNumber })
          }

          const selectedProxy = await findAvailableProxyForCallback(db, order.country, order.userId)
          let proxy = null
          if (selectedProxy) {
            proxy = await db
              .collection<Proxy>("proxies")
              .findOneAndUpdate({ _id: selectedProxy._id }, { $inc: { currentUsage: 1 } }, { returnDocument: "after" })
          }

          if (proxy) {
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
                failureReason: proxy ? undefined : "No proxies available in this country",
                mpesaReceiptNumber: receiptNumber,
                paidAt: new Date(),
              },
            }
          )
          return NextResponse.json({ status: proxy ? "paid" : "failed", receiptNumber })
        } 
        
        else if (type === "email" && emailOrder) {
          const lockResult = await db.collection("emailOrders").updateOne(
            { _id: emailOrder._id, status: { $nin: ["paid", "processing_payment"] } },
            { $set: { status: "processing_payment" } }
          )

          if (lockResult.modifiedCount === 0) {
            const dbEmailOrder = await db.collection("emailOrders").findOne({ _id: emailOrder._id })
            return NextResponse.json({
              status: dbEmailOrder?.status === "processing_payment" ? "pending" : dbEmailOrder?.status,
              receiptNumber: dbEmailOrder?.mpesaReceiptNumber
            })
          }

          // Double check database status to avoid race conditions with callback
          const dbEmailOrder = await db.collection("emailOrders").findOne({ _id: emailOrder._id })
          if (dbEmailOrder && dbEmailOrder.status === "paid") {
            return NextResponse.json({ status: "paid", receiptNumber: dbEmailOrder.mpesaReceiptNumber })
          }

          // Check if an email purchase already exists for this order
          const existingEmailPurchase = await db.collection("emailPurchases").findOne({ orderId: emailOrder._id })
          if (existingEmailPurchase) {
            await db.collection("emailOrders").updateOne(
              { _id: emailOrder._id },
              { $set: { status: "paid", mpesaReceiptNumber: receiptNumber, paidAt: new Date() } }
            )
            return NextResponse.json({ status: "paid", receiptNumber })
          }

          const availableEmails = await db
            .collection("emails")
            .find({
              domainId: emailOrder.domainId,
              status: "available",
            })
            .limit(emailOrder.quantity)
            .toArray()

          if (availableEmails.length >= emailOrder.quantity) {
            const emailIds = availableEmails.map((e) => e._id)
            await db.collection("emails").updateMany(
              { _id: { $in: emailIds } },
              { $set: { status: "sold" } }
            )

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

            await db.collection("emailOrders").updateOne(
              { _id: emailOrder._id },
              {
                $set: {
                  status: "paid",
                  mpesaReceiptNumber: receiptNumber,
                  paidAt: new Date(),
                },
              }
            )
            return NextResponse.json({ status: "paid", receiptNumber })
          } else {
            await db.collection("emailOrders").updateOne(
              { _id: emailOrder._id },
              {
                $set: {
                  status: "failed",
                  failureReason: "Insufficient emails available for this domain",
                },
              }
            )
            return NextResponse.json({ status: "failed", error: "Insufficient emails available" })
          }
        }
      } else if (resultCode !== null) {
        // Payment Failed (e.g. Cancelled, Timeout)
        if (type === "topup" && topUp) {
          const lockResult = await db.collection<TopUp>("topups").updateOne(
            { _id: topUp._id, status: { $nin: ["completed", "processing_payment"] } },
            { $set: { status: "failed", failureReason: resultDesc } }
          )
          if (lockResult.modifiedCount === 0) {
            const dbTopUp = await db.collection<TopUp>("topups").findOne({ _id: topUp._id })
            return NextResponse.json({
              status: dbTopUp?.status === "processing_payment" ? "pending" : dbTopUp?.status,
              receiptNumber: dbTopUp?.mpesaReceiptNumber
            })
          }
          return NextResponse.json({ status: "failed", error: resultDesc })
        } else if (type === "proxy" && order) {
          const lockResult = await db.collection<Order>("orders").updateOne(
            { _id: order._id, status: { $nin: ["paid", "completed", "processing_payment"] } },
            { $set: { status: "failed", failureReason: resultDesc } }
          )
          if (lockResult.modifiedCount === 0) {
            const dbOrder = await db.collection<Order>("orders").findOne({ _id: order._id })
            return NextResponse.json({
              status: dbOrder?.status === "processing_payment" ? "pending" : dbOrder?.status,
              receiptNumber: dbOrder?.mpesaReceiptNumber
            })
          }
          return NextResponse.json({ status: "failed", error: resultDesc })
        } else if (type === "email" && emailOrder) {
          const lockResult = await db.collection("emailOrders").updateOne(
            { _id: emailOrder._id, status: { $nin: ["paid", "processing_payment"] } },
            { $set: { status: "failed", failureReason: resultDesc } }
          )
          if (lockResult.modifiedCount === 0) {
            const dbEmailOrder = await db.collection("emailOrders").findOne({ _id: emailOrder._id })
            return NextResponse.json({
              status: dbEmailOrder?.status === "processing_payment" ? "pending" : dbEmailOrder?.status,
              receiptNumber: dbEmailOrder?.mpesaReceiptNumber
            })
          }
          return NextResponse.json({ status: "failed", error: resultDesc })
        }
      }
    } catch (queryError) {
      console.error("Direct Safaricom query failed, returning status pending:", queryError);
    }

    return NextResponse.json({ status: "pending" })
  } catch (error: any) {
    console.error("query-status caught error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message.includes("vercel resources exceeded")) {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Query M-Pesa transaction error:", error)
    return NextResponse.json({ error: "Failed to query transaction status" }, { status: 500 })
  }
}
