import User from '../models/User.js';
import AIProfileMemory from '../models/AIProfileMemory.js';
import CodingProgress from '../models/CodingProgress.js';
import Resume from '../models/Resume.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../services/mailService.js';

// Helper to generate access & refresh tokens
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '60d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      verificationToken,
    });

    if (user) {
      // If user is a student, seed related profiles
      if (user.role === 'student') {
        await AIProfileMemory.create({ studentId: user._id });
        await CodingProgress.create({ studentId: user._id });
        await Resume.create({
          studentId: user._id,
          currentVersion: 1,
          versions: [
            {
              version: 1,
              templateType: 'modern',
              summary: 'Enthusiastic professional starting career journey.',
              skills: [],
              education: [],
              experience: [],
              projects: [],
              certifications: [],
            },
          ],
        });
      }

      // Send Verification Email
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
      const emailText = `Welcome to CareerOS, ${user.name}!\n\nPlease verify your email by clicking: ${verificationUrl}`;
      const emailHtml = `<h1>Welcome to CareerOS, ${user.name}!</h1><p>Please click the link below to verify your account and claim your first 100 XP starter bonus:</p><a href="${verificationUrl}">${verificationUrl}</a>`;

      await sendEmail({
        to: user.email,
        subject: 'Verify your CareerOS Account',
        text: emailText,
        html: emailHtml,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Verification email sent.',
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          xp: user.xp,
          coins: user.coins,
          level: user.level,
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Manage Streak Points
      const today = new Date().toDateString();
      const lastActive = new Date(user.lastActiveDate).toDateString();
      let xpEarned = 0;

      if (lastActive !== today) {
        // Increment streak if logged in on consecutive day
        const oneDayMs = 24 * 60 * 60 * 1000;
        const diffMs = new Date(today) - new Date(lastActive);
        if (diffMs <= oneDayMs) {
          user.dailyStreak += 1;
        } else {
          user.dailyStreak = 1;
        }
        // Reward login XP
        xpEarned = 10 * user.dailyStreak;
        user.xp += xpEarned;
        user.lastActiveDate = new Date();

        // Level Up Check
        const nextLevelXp = user.level * 100;
        if (user.xp >= nextLevelXp) {
          user.level += 1;
          user.badges.push({
            name: `Level ${user.level} Achiever`,
            icon: 'award',
            description: `Reached Level ${user.level} by earning XP!`,
          });
        }

        await user.save();
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id),
        xpAwarded: xpEarned,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          xp: user.xp,
          coins: user.coins,
          level: user.level,
          dailyStreak: user.dailyStreak,
          badges: user.badges,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Callback Mock/Direct endpoint
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res, next) => {
  const { googleId, name, email, avatar } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create Google SSO user
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        isVerified: true,
      });

      if (user.role === 'student') {
        await AIProfileMemory.create({ studentId: user._id });
        await CodingProgress.create({ studentId: user._id });
        await Resume.create({
          studentId: user._id,
          currentVersion: 1,
          versions: [
            {
              version: 1,
              templateType: 'modern',
              summary: 'Google authenticated user resume profile.',
              skills: [],
              education: [],
              experience: [],
              projects: [],
              certifications: [],
            },
          ],
        });
      }
    } else {
      user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      await user.save();
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        coins: user.coins,
        level: user.level,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).send('<h1>Verification failed. Invalid or expired token.</h1>');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    
    // Reward verify bonus XP and Coins
    user.xp += 100;
    user.coins += 50;
    user.badges.push({
      name: 'Career Starter',
      icon: 'sparkles',
      description: 'Awarded for verifying your email address!',
    });

    await user.save();

    res.send('<h1>Email Verified Successfully!</h1><p>You earned 100 XP and 50 Coins. You may close this tab and log in.</p>');
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const emailHtml = `<h1>Password Reset Request</h1><p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`;

    await sendEmail({
      to: user.email,
      subject: 'CareerOS Password Reset',
      text: `Reset URL: ${resetUrl}`,
      html: emailHtml,
    });

    res.json({ success: true, message: 'Reset password link sent' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/resetpassword/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};
