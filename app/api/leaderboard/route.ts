import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "test";

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

export async function GET() {
  let client: MongoClient | null = null;
  try {
    console.log("Attempting to connect to MongoDB...");
    client = await MongoClient.connect(uri!);
    console.log("Connected successfully to MongoDB");

    const db = client.db(dbName);
    console.log("Accessing database:", dbName);

    console.log("Querying leaderboards collection...");
    const topDonors = await db
      .collection("ccrs")
      .find()
      .sort({ wave: -1 })
      .limit(10)
      .toArray();

    console.log(
      "Query successful. Number of donors retrieved:",
      topDonors.length
    );
    return NextResponse.json(topDonors, { status: 200 });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Error fetching top donors",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
}
