const Request  = require('../models/Request');
const Donation = require('../models/Donation');

exports.create = async (req, res) => {
  try {
    const { donationId, message } = req.body;
    const existing = await Request.findOne({ ngo: req.user._id, donation: donationId });
    if (existing) return res.status(400).json({ message: 'Already requested' });
    const request = await Request.create({ ngo: req.user._id, donation: donationId, message });
    res.status(201).json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.ngoRequests = async (req, res) => {
  try {
    const requests = await Request.find({ ngo: req.user._id }).populate('donation').sort('-createdAt');
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.donationRequests = async (req, res) => {
  try {
    const requests = await Request.find({ donation: req.params.donationId }).populate('ngo', 'name email organizationName phone').sort('-createdAt');
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id).populate('donation');
    if (!request) return res.status(404).json({ message: 'Not found' });

    const donation = await Donation.findById(request.donation._id);
    const isDonor = donation.donor.toString() === req.user._id.toString();
    const isNgoOwner = request.ngo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    console.log('DEBUG updateStatus:', { status, requestNgo: request.ngo, userId: req.user._id, userRole: req.user.role, isDonor, isNgoOwner, isAdmin });

    if (status === 'collected' && !isNgoOwner && !isAdmin)
      return res.status(403).json({ message: 'Forbidden - not ngo owner' });
    if (status !== 'collected' && !isDonor && !isAdmin)
      return res.status(403).json({ message: 'Forbidden - not donor' });

    request.status = status;
    if (status === 'collected') request.collectedAt = new Date();
    await request.save();

    if (status === 'accepted') {
      donation.status     = 'accepted';
      donation.assignedTo = request.ngo;
      await donation.save();
      // Reject all other pending requests for same donation
      await Request.updateMany(
        { donation: donation._id, _id: { $ne: request._id }, status: 'pending' },
        { status: 'rejected' }
      );
    }
    if (status === 'collected') {
      donation.status = 'collected';
      await donation.save();
    }
    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.all = async (req, res) => {
  try {
    const requests = await Request.find().populate('ngo', 'name email').populate('donation', 'foodType quantity pickupAddress donor').sort('-createdAt');
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
