import { protectRoute } from "../middleware/auth.midlleware";
import express from "express";

import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:userId([a-f0-9]{24})", protectRoute, getMessages);

router.post("/send/:receiverId([a-f0-9]{24})", protectRoute, sendMessage);

export default router;