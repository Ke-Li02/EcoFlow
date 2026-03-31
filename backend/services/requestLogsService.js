const { getLogRequestVolume } = require("../models/requestLogsModel");

async function getRequestVolume() {
    return await getLogRequestVolume();
}

module.exports = { getRequestVolume }