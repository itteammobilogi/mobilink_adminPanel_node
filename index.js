import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { dbConnect } from "./config/dbConnection.js";
import campaignRoute from "./routes/campaignRoute.js";
import authRoute from "./routes/userRoute.js";
import publisherRoute from "./routes/publisherRoute.js";
import { fileURLToPath } from "url";

dotenv.config({});

const app = express();
dbConnect();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOption = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOption));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "./utils/uploads")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/admin/auth", authRoute);
app.use("/api/admin/campaign", campaignRoute);
app.use("/api/admin/publisher", publisherRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON ${PORT}`);
});
