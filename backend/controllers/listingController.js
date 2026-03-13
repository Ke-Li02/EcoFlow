const listingService = require('../services/listingService');

async function createListingHandler(req, res) {
  const { name, description, address, hourlyRate } = req.body;
  if (!name || !description || !address || !hourlyRate || !req.file) return res.status(400).json({ message: 'A parameter is missing' });

  try {
    const listing = await listingService.createListing(name, description, true, address, req.file.path, hourlyRate, req.user.id);
    res.status(201).json(listing);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function getAvailableListingsHandler(req, res) {
  try {
    const listings = await listingService.getAvailableListings();
    res.status(200).json(listings);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { createListingHandler, getAvailableListingsHandler };

