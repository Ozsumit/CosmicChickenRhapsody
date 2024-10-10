import { NextResponse } from "next/server";
import clientPromise from "@/utils/mongodb";
import { MongoClient } from "mongodb";

export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("test");

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
  }
}