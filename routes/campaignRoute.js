import express from "express";
import {
  createCampaign,
  deleteSingleCampaign,
  getAllCampaign,
  getSingleCampaign,
  updateCampaign,
} from "../controller/campaignCtrl.js";
import upload from "../utils/multer.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const app = express.Router();

app.post(
  "/create/campaign",
  upload.single("image"),
  authMiddleware,
  createCampaign
);
app.put(
  "/update/campaign/:id",
  upload.single("image"),
  authMiddleware,
  updateCampaign
);
app.delete("/delete/campaign/:id", authMiddleware, deleteSingleCampaign);
app.get("/single/campaign/:id", getSingleCampaign);
app.get("/getall/campaigns", getAllCampaign);

export default app;
