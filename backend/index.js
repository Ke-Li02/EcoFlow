require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const adminRoutes = require('./routes/adminDashboardRoutes');
const { createUsersTable } = require('./models/userModel');
const { createVehiclesTable } = require('./models/vehicleModel');
const { createOwnershipsTable } = require('./models/ownershipModel');
const { createRentalsTable } = require('./models/rentalModel');
const { createRequestLogsTable } = require('./models/requestLogsModel');
const requestLoggerMiddleware = require('./middlewares/log');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLoggerMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/listing', listingRoutes);
app.use('/api/rental', rentalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));

async function main() {
  try {
    await createUsersTable();
    await createVehiclesTable();
    await createOwnershipsTable();
    await createRentalsTable();
    await createRequestLogsTable();

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

main();