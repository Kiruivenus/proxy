import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "rayproxy"

async function migrate() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)

    console.log("Starting proxy status migration...")

    // Add status field to proxies that don't have it
    const proxiesCollection = db.collection("proxies")

    const result = await proxiesCollection.updateMany(
      { status: { $exists: false } },
      [
        {
          $set: {
            status: {
              $cond: [
                { $lt: ["$expiresAt", new Date()] },
                "expired",
                "available"
              ]
            }
          }
        }
      ]
    )

    console.log(`Updated ${result.modifiedCount} proxies with status field`)

    // Ensure supportConfig collection exists with default values
    const supportConfig = db.collection("supportConfig")
    const existingConfig = await supportConfig.findOne({})

    if (!existingConfig) {
      await supportConfig.insertOne({
        whatsappNumber: "",
        whatsappGroup: "",
        telegramAgent: "",
        telegramGroup: "",
        updatedAt: new Date(),
      })
      console.log("Created default support config")
    }

    console.log("Migration completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

migrate()
