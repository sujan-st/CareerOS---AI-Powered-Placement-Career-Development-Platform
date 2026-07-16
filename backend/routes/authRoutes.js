import express from 'express';
import {
  registerUser,
  loginUser,
  googleLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/verify/:token', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/:token', resetPassword);

export default router;
