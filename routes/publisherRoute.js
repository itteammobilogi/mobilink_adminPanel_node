import express from "express";

import {
  createPublisher,
  createPublisherInTrackier,
  deletePublisher,
  getPublisher,
  updatePublisher,
} from "../controller/publisherCtrl.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const app = express.Router();

app.post("/create/publisher", createPublisher);
app.post("/createPublisher", createPublisherInTrackier);
app.post("/updatePublisher", updatePublisher);
app.get("/getall/publisher", authMiddleware, getPublisher);
app.delete("/delete/publisher/:id", authMiddleware, deletePublisher);

export default app;
