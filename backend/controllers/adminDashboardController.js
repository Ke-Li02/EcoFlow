const { getRequestVolume } = require('../services/requestLogsService');

async function getAdminDashboardHandler(req, res) {
    try {
        const requestVolume = await getRequestVolume();
        res.status(200).json({ requestVolume });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
}

module.exports = { getAdminDashboardHandler };