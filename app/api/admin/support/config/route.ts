import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    let config = await db.collection("supportConfig").findOne({})

    if (!config) {
      config = {
        whatsappNumber: "",
        whatsappGroup: "",
        telegramAgent: "",
        telegramGroup: "",
      }
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error("Failed to fetch support config:", error)
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    await db.collection("supportConfig").updateOne(
      {},
      {
        $set: {
          whatsappNumber: body.whatsappNumber || "",
          whatsappGroup: body.whatsappGroup || "",
          telegramAgent: body.telegramAgent || "",
          telegramGroup: body.telegramGroup || "",
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update support config:", error)
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 })
  }
}
