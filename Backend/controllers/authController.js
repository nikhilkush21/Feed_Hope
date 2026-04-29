const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, organization, organizationName, address, phone, registrationNumber } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password, role, organization: organization || organizationName, organizationName, address, phone, registrationNumber });
    const token = signToken(user._id);
    res.status(201).json({ token, _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive)
      return res.status(403).json({ message: 'Account disabled' });

    const token = signToken(user._id);
    res.json({ token, _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = (req, res) => res.json(req.user);
