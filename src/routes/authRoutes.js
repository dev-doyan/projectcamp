import express from "express";
const router=express.Router();

import {register}from "../controller/authcontroller.js"

router.post("/register",register);
// router.post("/login");
// router.post("/refresh-token");
// router.get("/verify-email/:verificationToken");
// router.post("/forgot-password");
// router.post("/reset-password/:resetToken");

// router.post("/logout");
// router.get("/current-user");
// router.post("/change-password");
// router.post("/resend-email-verification");

export default router 