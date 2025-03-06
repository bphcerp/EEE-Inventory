import express from "express";
import ViteExpress from "vite-express";

const app = express();

app.get("/api", (_, res) => {
  res.send("EEE Inventory API.");
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
