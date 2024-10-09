// app/api/data/route.js
import connectDB from "../../../lib/connectdb"; // Adjust based on your structure
import User from "../../../models/user"; // Adjust based on your structure

export async function POST(req) {
  await connectDB();

  const { name, wave } = await req.json();

  // Validate request data
  if (!name || wave === undefined || wave === null) {
    return new Response(JSON.stringify({ message: "Missing name or wave value" }), {
      status: 400,
    });
  }

  try {
    console.log("Received Data:", { name, wave });

    // Update or create the user in the database
    const user = await User.findOneAndUpdate(
      { name: name },
      { $set: { wave: wave } },
      { new: true, upsert: true }
    );

    console.log("User updated/created:", user);
    return new Response(JSON.stringify({ message: "User updated successfully", user }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating/creating user:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error: Failed to update user" }), {
      status: 500,
    });
  }
}
