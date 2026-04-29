const router = require('express').Router();
const c = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/',                          protect, authorize('ngo', 'admin'), c.create);
router.get('/ngo',                        protect, authorize('ngo', 'admin'), c.ngoRequests);
router.get('/all',                        protect, authorize('admin'), c.all);
router.get('/donation/:donationId',       protect, c.donationRequests);
router.put('/:id/status',                 protect, authorize('donor', 'ngo', 'admin'), c.updateStatus);

module.exports = router;
