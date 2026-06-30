const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), 'server', '.env') });
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
  console.error('Missing MySQL environment variables. Please set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE.');
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    return res.json({ status: 'ok', message: 'API server is healthy', db: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error);
    return res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

async function insertInputsRecord(req, res, tableName) {
  const {
    category,
    values,
    imageUris,
    contact,
    ipAddressLocation,
    status,
    updatedAt,
    createdAt,
  } = req.body;

  if (!category || !values || !imageUris || !ipAddressLocation || !updatedAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }



  // Use provided createdAt or set now
  const createdAtDate = createdAt ? new Date(createdAt) : new Date();

  try {
    const [result] = await pool.execute(
      `INSERT INTO ${tableName}
        (category, values_json, image_uris_json, contact_phone, contact_email, ipAddressLocation, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category,
        JSON.stringify(values),

        JSON.stringify(imageUris),
        contact?.phone || null,
        contact?.email || null,
        ipAddressLocation,
        status || null,
        createdAtDate,
        new Date(updatedAt),
      ]
    );

    return res.json({ message: 'Saved to MySQL', id: result.insertId });
  } catch (error) {
    console.error('MySQL insert failed:', error);
    return res.status(500).json({ error: 'Unable to save data to database', details: error.message });
  }
}

app.post('/api/dynamic-inputs', async (req, res) => insertInputsRecord(req, res, 'dynamic_inputs'));

app.post('/api/business-inputs', async (req, res) => insertInputsRecord(req, res, 'business_inputs'));

app.listen(port, '0.0.0.0', () => {
  console.log(`API server listening on port ${port}`);
});
