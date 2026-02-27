import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const db = await getDb()
    const emails = await db
      .collection("emails")
      .aggregate([
        {
          $lookup: {
            from: "emailDomains",
            localField: "domainId",
            foreignField: "_id",
            as: "domainData",
          },
        },
        { $unwind: "$domainData" },
      ])
      .toArray()

    return NextResponse.json({
      emails: emails.map((e) => ({
        id: e._id.toString(),
        emailAddress: e.emailAddress,
        domain: e.domainData.domain,
        status: e.status,
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching emails:", error)
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { emailAddress, password, domainId } = await request.json()

    if (!emailAddress || !password || !domainId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()

    // Verify domain exists
    const domain = await db.collection("emailDomains").findOne({
      _id: new ObjectId(domainId),
    })

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    // Check if email already exists
    const existingEmail = await db.collection("emails").findOne({
      emailAddress,
    })

    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const result = await db.collection("emails").insertOne({
      emailAddress,
      password,
      domain: domain.domain,
      domainId: new ObjectId(domainId),
      server: domain.server,
      status: "available",
      createdAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating email:", error)
    return NextResponse.json({ error: "Failed to create email" }, { status: 500 })
  }
}
