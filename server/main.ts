import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";

// Importing Routes
import apiRoutes from "./routes/apiRoutes"

//TypeORM Required Metadata Import
import "reflect-metadata"

import expressWs from "express-ws";
import path from "path";

const app = express();
expressWs(app)

config({
  path: path.join(__dirname, process.env.NODE_ENV === 'development' ? '.env.development' : '.env.production')
})

// Enable CORS and allow credentials to be passed on
app.use(cors({
  origin: process.env.FRONTEND_URL!,
  credentials : true
}))

// Parse body of incoming requests as JSON
app.use(express.json());

// Parse the cookies to a JSON object
app.use(cookieParser());

// Using the routes from the routes folder
app.use("/api", apiRoutes);

//GET: /api API Home Route
app.get("/api", (_, res) => {
  res.send("EEE Inventory API.");
});

// Websocket listener to bulk add from Excel
//@ts-ignore
// Tried adding this in inventoryRoutes but there's an issue with ViteExpress and express-ws
app.ws('/api/inventory/excel', (ws, _req) => {
  console.log("WebSocket Connected");

  ws.on('open', () => console.log('Hello'))

  ws.on("message", (msg: any) => {
      console.log("Received:", msg);
  });

  ws.on("close", () => {
      console.log("WebSocket Disconnected");
  });
});


// Serve both frontend and backend
app.listen(parseInt(process.env.PORT!), () =>
  console.log(`Server is listening on port ${process.env.PORT}...`),
);
