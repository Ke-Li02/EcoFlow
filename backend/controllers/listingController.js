const listingService = require('../services/listingService');

async function createListingHandler(req, res) {
  const { name, description, address, hourlyRate, region, vehicleType } = req.body;
  if (!name || !description || !address || !hourlyRate || !region || !vehicleType || !req.file) return res.status(400).json({ message: 'A parameter is missing' });

  try {
    const listing = await listingService.createListing(name, description, true, address, req.file.path, hourlyRate, req.user.id, region, vehicleType);
    res.status(201).json(listing);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function getMyListingsHandler(req, res) {
  try {
    const listings = await listingService.findListings(req.user.id);
    res.status(200).json(listings);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateListingHandler(req, res) {
  const { id } = req.params;
  const { name, description, address, hourlyRate, region, vehicleType } = req.body;
  
  try {
    const listing = await listingService.updateListing(id, req.user.id, {
      name: name ?? undefined,
      description: description ?? undefined,
      address: address ?? undefined,
      photoPath: req.file?.path ?? undefined,
      hourlyRate: hourlyRate ?? undefined,
      region: region ?? undefined,
      vehicleType: vehicleType ?? undefined,
    });
    if (!listing) return res.status(404).json({ message: 'Listing not found or access denied' });
    res.status(200).json(listing);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteListingHandler(req, res) {
    const { id } = req.params;
    try {
        const deleted = await listingService.removeListing(id, req.user.id);
        if (!deleted) return res.status(404).json({ message: 'Listing not found or access denied' });
        res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
}

async function getMyListingByIdHandler(req, res) {
  const { id } = req.params;
  try {
    const listing = await listingService.findListingById(id, req.user.id);
    res.status(200).json(listing);
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

async function executeListingCommandsHandler(req, res) {
  const { operations } = req.body;
  if (!Array.isArray(operations)) {
    return res.status(400).json({ message: 'operations must be an array' });
  }

  try {
    const results = await listingService.executeListingCommands(operations, req.user.id);
    res.status(200).json({ processed: results.length, results });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Failed to execute listing commands' });
  }
}


module.exports = { createListingHandler, getMyListingsHandler, getAvailableListingsHandler, executeListingCommandsHandler, updateListingHandler, deleteListingHandler, getMyListingByIdHandler };

