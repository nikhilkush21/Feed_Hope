const router = require('express').Router();
const c = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/',          protect, authorize('donor', 'admin'), c.create);
router.get('/my',         protect, authorize('donor', 'admin'), c.myDonations);
router.get('/nearby',     protect, c.nearby);
router.get('/all',        protect, authorize('admin'), c.all);
router.get('/:id',        protect, c.getOne);
router.put('/:id',        protect, c.update);
router.delete('/:id',     protect, c.remove);

module.exports = router;
