import express from "express";
import {
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../controller/userCtrl.js";

const app = express.Router();

app.post("/login", loginAdmin);
app.post("/register", registerAdmin);
app.post("/logout/admin", logoutAdmin);

export default app;
