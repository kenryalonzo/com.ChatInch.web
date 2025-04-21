import express from 'express';
import { login, logout, signup } from '../controllers/auth.controller';
import { protectRoute } from '../middleware/auth.midlleware';
import { updateProfile, checkAuth } from '../controllers/auth.controller';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.put("/update-profile", protectRoute, updateProfile)

router.get("/check", protectRoute, checkAuth)

export default router;