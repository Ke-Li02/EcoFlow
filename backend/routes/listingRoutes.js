const { Router } = require('express');
const { createListingHandler, getMyListingsHandler, getAvailableListingsHandler, executeListingCommandsHandler } = require('../controllers/listingController');
const verifyToken = require('../middlewares/verifyToken')
const upload = require('../middlewares/upload')
const router = Router();

// routes
router.post('/create', verifyToken, upload.single('photo'), createListingHandler);
router.post('/batch', verifyToken, executeListingCommandsHandler);
router.get('/my-listings', verifyToken, getMyListingsHandler);
router.get('/available', verifyToken, getAvailableListingsHandler);

module.exports = router;