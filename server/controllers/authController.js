const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User } = require('../db');

// In-memory OTP cache for email verification
const otpCache = {};

const JWT_SECRET = process.env.JWT_SECRET || 'hindconnect_secret_key_2026';

const register = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      department,
      mobile,
      bloodGroup,
      doj,
      empCode,
      designation,
      emergencyContact
    } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Employee',
      department,
      isApproved: false,
      mobile,
      bloodGroup,
      doj,
      empCode,
      designation,
      emergencyContact
    });

    // Notify all Admins about this registration request
    try {
      const { Notification } = require('../db');
      const admins = await User.find({ role: 'Admin' });
      for (let admin of admins) {
        await Notification.create({
          userId: admin.id || admin._id,
          message: `New user registration pending approval: ${name} (${role || 'Employee'}, ${department})`,
          isRead: false
        });
      }
    } catch (notifErr) {
      console.warn('Failed to create admin notification:', notifErr.message);
    }

    res.status(201).json({
      message: 'Registration successful! Your account is pending IT Administrator approval.',
      pending: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isApproved === false) {
      return res.status(403).json({ message: 'Your registration is pending approval by an IT Administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        mobile: user.mobile,
        bloodGroup: user.bloodGroup,
        doj: user.doj,
        empCode: user.empCode,
        designation: user.designation,
        emergencyContact: user.emergencyContact
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      mobile: user.mobile,
      bloodGroup: user.bloodGroup,
      doj: user.doj,
      empCode: user.empCode,
      designation: user.designation,
      emergencyContact: user.emergencyContact
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const formatted = users.map(u => ({
      id: u.id || u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      isApproved: u.isApproved !== false, // default to true if undefined
      createdAt: u.createdAt,
      mobile: u.mobile,
      bloodGroup: u.bloodGroup,
      doj: u.doj,
      empCode: u.empCode,
      designation: u.designation,
      emergencyContact: u.emergencyContact
    }));
    res.json(formatted);
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: 'Server error retrieving user list' });
  }
};

const approveUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(userId, { isApproved: true });

    // Notify the user about their approval
    try {
      const { Notification } = require('../db');
      await Notification.create({
        userId: userId,
        message: 'Your account registration has been approved by the IT Administrator. You can now access all portal features.',
        isRead: false
      });
    } catch (notifErr) {
      console.warn('Failed to notify approved user:', notifErr.message);
    }

    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('approveUser error:', error);
    res.status(500).json({ message: 'Server error approving user' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mobile, bloodGroup, doj, empCode, designation, emergencyContact } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      mobile,
      bloodGroup,
      doj,
      empCode,
      designation,
      emergencyContact
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id || updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        isApproved: updatedUser.isApproved,
        mobile: updatedUser.mobile,
        bloodGroup: updatedUser.bloodGroup,
        doj: updatedUser.doj,
        empCode: updatedUser.empCode,
        designation: updatedUser.designation,
        emergencyContact: updatedUser.emergencyContact
      }
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No registered corporate user account found with this email' });
    }

    if (user.isApproved === false) {
      return res.status(403).json({ message: 'Your registration is pending approval by an IT Administrator.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Store in cache
    otpCache[email.toLowerCase()] = { otp, expiresAt };

    // Check if SMTP is configured
    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT;
    const userEmail = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (host && port && userEmail && pass) {
      console.log(`Sending real OTP email to ${email} via SMTP...`);
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: port === '465',
        auth: {
          user: userEmail,
          pass: pass
        }
      });

      const mailOptions = {
        from: `"HindConnect Security" <${userEmail}>`,
        to: email,
        subject: 'HindConnect Corporate Login OTP Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #0f2942; color: #ffffff; padding: 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; letter-spacing: 0.5px;">HindConnect Auth</h2>
              <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #f97316;">HINDALCO INDUSTRIES LIMITED</p>
            </div>
            <div style="padding: 32px; background-color: #ffffff; color: #334155;">
              <p style="font-size: 15px; line-height: 1.5; margin-top: 0;">Hello ${user.name},</p>
              <p style="font-size: 14px; line-height: 1.5;">You requested a password-less OTP verification code to access the HindConnect portal. Use the 6-digit code below to authenticate:</p>
              
              <div style="text-align: center; margin: 32px 0;">
                <span style="display: inline-block; font-family: monospace; font-size: 36px; font-weight: 800; color: #f97316; letter-spacing: 6px; padding: 12px 24px; background-color: #fff7ed; border: 1px dashed #fdba74; border-radius: 6px;">${otp}</span>
              </div>
              
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">* This verification code is valid for <strong>5 minutes</strong>. If you did not make this request, please contact the IT Security helpdesk immediately.</p>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8;">
              © 2026 HindConnect. Authorized Corporate Access Only.
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP successfully sent to email: ${email}`);
    } else {
      // Fallback developer mode
      console.log(`\n==================================================`);
      console.log(`[MOCK EMAIL OTP] Sent to: ${email}`);
      console.log(`[MOCK EMAIL OTP] Verification Code: ${otp}`);
      console.log(`==================================================\n`);
    }

    res.json({ message: 'OTP verification code has been sent successfully.' });
  } catch (error) {
    console.error('sendOtp error:', error);
    res.status(500).json({ message: 'Server error generating OTP' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and verification code' });
    }

    const record = otpCache[email.toLowerCase()];
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpCache[email.toLowerCase()];
      return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect verification code. Please check and try again.' });
    }

    // Success! Remove from cache so it cannot be reused
    delete otpCache[email.toLowerCase()];

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        mobile: user.mobile,
        bloodGroup: user.bloodGroup,
        doj: user.doj,
        empCode: user.empCode,
        designation: user.designation,
        emergencyContact: user.emergencyContact
      }
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

const getRecipients = async (req, res) => {
  try {
    const users = await User.find({});
    const formatted = users.map(u => ({
      id: u.id || u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department
    }));
    res.json(formatted);
  } catch (error) {
    console.error('getRecipients error:', error);
    res.status(500).json({ message: 'Server error retrieving recipient list' });
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  getMe,
  getAllUsers,
  approveUser,
  updateProfile,
  getRecipients,
  JWT_SECRET
};
