import { Pool } from 'pg';

// Load environment variables


// Set up the connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:JilaVlivHflafoAWlphgXcDHRufCZxiI@junction.proxy.rlwy.net:39718/railway',
  ssl: {
    rejectUnauthorized: false, // This is needed to connect securely to Railway's PostgreSQL
  },
});



export default pool;
