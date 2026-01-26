const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool
  .query("SELECT 1")
  .then(() => console.log("✅ DB připojena"))
  .catch(err => {
    console.error("❌ DB chyba", err);
    process.exit(1);
  });

module.exports = pool;
