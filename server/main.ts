import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import path from 'path'

// Importing Routes
import apiRoutes from "./routes/apiRoutes"

//TypeORM Required Metadata Import
import "reflect-metadata"
import { WebSocketExpress } from "websocket-express";

const app = new WebSocketExpress();

config()

// Enable CORS and allow credentials to be passed on
app.useHTTP(cors({
  origin: process.env.FRONTEND_URL!,
  credentials : true
}))

// Parse body of incoming requests as JSON
app.useHTTP(express.json());

// Parse the cookies to a JSON object
app.useHTTP(cookieParser());

// Using the routes from the routes folder
app.use("/api", apiRoutes);

//GET: /api API Home Route
app.get("/api", (_, res) => {
  res.send("EEE Inventory API.");
});

// Serve at PORT
const server = app.createServer()
server.listen(parseInt(process.env.PORT!), () =>
  console.log(`Server is listening on port ${process.env.PORT}...`),
);
