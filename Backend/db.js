const Pkg=require('pg');
const { Pool } = Pkg;
const pool = new Pool({
  user: 'admin1',
  host: 'localhost',
  database: 'hospital_db_main',
  password: 'root',
  port: 5432
});

module.exports=pool