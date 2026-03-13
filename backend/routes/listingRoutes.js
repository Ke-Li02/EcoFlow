const { Router } = require('express');
const { createListingHandler, getAvailableListingsHandler } = require('../controllers/listingController');
const verifyToken = require('../middlewares/verifyToken')
const upload = require('../middlewares/upload')
const router = Router();

// routes
router.post('/create-listing', verifyToken, upload.single('photo'), createListingHandler);
router.get('/available', verifyToken, getAvailableListingsHandler);

module.exports = router;