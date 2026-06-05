require('dotenv').config({ path: require('path').resolve(__dirname, 'server/.env') });
const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });
  try {
    console.log('Connecting to', process.env.MYSQL_HOST, process.env.MYSQL_DATABASE);
    const [rows] = await pool.query("SELECT 1 AS ok");
    console.log('SELECT 1 result:', rows);
    const [tables] = await pool.query("SHOW TABLES LIKE 'dynamic_inputs'");
    console.log('TABLES:', JSON.stringify(tables));
    if (tables.length > 0) {
      const [count] = await pool.query('SELECT COUNT(*) AS cnt FROM dynamic_inputs');
      console.log('COUNT:', JSON.stringify(c      console.log('COUNT:', JrtRes] = await pool.e      console.log('COUNT:', JSON.stringify(c      console.log('COUNT:', JrtRes] = await pool.e    co      console.log('COUNT:', JSON.string (      console,       console.log('COUNT:', JSON',
        JSON.stringify({ address: 'Test EC2 connection', rooms: 2 }),
        JSON.stringify(['https://exam        JSON.stringify(['ht  '0912        JSON.stringify(['https://.com',
                                          05T00:00:00Z'),
      ]
    );
                        R             es);
  } cat  } car)  } cat  } car)  } cat  } car)  } cat  } car)  } cat  } car)  } cat  } car)process.exit(1);
  } finally {
    await pool.end();
  }
})();
