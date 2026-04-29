const Donation = require('../models/Donation');

exports.create = async (req, res) => {
  try {
    const donation = await Donation.create({ ...req.body, donor: req.user._id });
    res.status(201).json(donation);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.myDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id }).sort('-createdAt');
    res.json(donations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.nearby = async (req, res) => {
  try {
    const { location } = req.query;
    const filter = { status: 'pending' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    const donations = await Donation.find(filter).populate('donor', 'name email').sort('-createdAt');
    res.json(donations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.all = async (req, res) => {
  try {
    const donations = await Donation.find().populate('donor', 'name email').populate('assignedTo', 'name').sort('-createdAt');
    res.json(donations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donor', 'name email').populate('assignedTo', 'name');
    if (!donation) return res.status(404).json({ message: 'Not found' });
    res.json(donation);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    Object.assign(donation, req.body);
    await donation.save();
    res.json(donation);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    await donation.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
