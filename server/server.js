import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();
const port = 3000;

await connectDB();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("Server is Live!"));
app.post("/api/clerk-webhooks", async (req, res) => {
  try {
    const event = req.body;

    await inngest.send({
      name: event.type,
      data: event.data,
    });

    console.log(`Forwarded event to Inngest: ${event.type}`);
    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error("Failed to forward event to Inngest:", error);
    res.status(500).json({ message: "error" });
  }
});
app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
