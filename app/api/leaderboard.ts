import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "CCR";

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    let client: MongoClient | null = null;
    try {
      console.log("Attempting to connect to MongoDB...");
      client = await MongoClient.connect(uri!); // Remove useNewUrlParser and useUnifiedTopology
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
      res.status(200).json(topDonors);
    } catch (error) {
      console.error("Detailed error:", error);
      res.status(500).json({
        error: "Error fetching top donors",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      if (client) {
        await client.close();
        console.log("MongoDB connection closed");
      }
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
