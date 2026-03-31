const { getLogRequestVolume, getStatusCodeBreakdown, getTopEndpoints } = require('../models/requestLogsModel');

async function getAdminDashboardHandler(req, res) {
    try {
        const [requestVolume, statusBreakdown, topEndpoints] = await Promise.all([
            getLogRequestVolume(),
            getStatusCodeBreakdown(),
            getTopEndpoints(),
        ]);
        res.status(200).json({ requestVolume, statusBreakdown, topEndpoints });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
}

module.exports = { getAdminDashboardHandler };