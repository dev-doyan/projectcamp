import express from "express";
const router=express.Router();

import {register,verifyemail,login, currentuser, refreshToken, logout}from "../controller/authcontroller.js"
import { authenticate } from "../middlewear/authenticate.js";

router.post("/register",register);
router.post("/login",login);
router.post("/refresh-token",refreshToken);
router.get("/verify-email/:verificationToken",verifyemail)
// router.post("/forgot-password");
// router.post("/reset-password/:resetToken");

router.post("/logout",authenticate,logout);
router.get("/current-user",authenticate,currentuser);
// router.post("/change-password");
// router.post("/resend-email-verification");

export default router 