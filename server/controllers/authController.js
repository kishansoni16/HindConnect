const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'hindconnect_secret_key_2026';

const register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

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
      isApproved: false
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
        department: user.department
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
      department: user.department
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
      createdAt: u.createdAt
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

module.exports = {
  register,
  login,
  getMe,
  getAllUsers,
  approveUser,
  JWT_SECRET
};
