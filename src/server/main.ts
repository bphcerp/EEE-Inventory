import express from "express";
import ViteExpress from "vite-express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";

//TypeORM Required Metadata Import
import "reflect-metadata"

const app = express();
config()

// Enable CORS and allow credentials to be passed on
app.use(cors({
  credentials : true
}))

// Parse body of incoming requests as JSON
app.use(express.json());

// Parse the cookies to a JSON object
app.use(cookieParser());

//GET: /api API Home Route
app.get("/api", (_, res) => {
  res.send("EEE Inventory API.");
});

// Serve both frontend and backend
ViteExpress.listen(app, parseInt(process.env.PORT!), () =>
  console.log(`Server is listening on port ${process.env.PORT}...`),
);
