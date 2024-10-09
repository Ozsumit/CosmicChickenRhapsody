// pages/api/getDonation.js
import { getData } from "../../data";

export default function handler(req, res) {
  if (req.method === "GET") {
    const { name } = req.query;
    try {
      const data = getData();
      const user = data.find((user) => user.name === name);

      if (user) {
        res.status(200).json({ donation: user.donations });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching donation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
