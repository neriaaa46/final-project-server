
const mysql = require('mysql2/promise');


const db = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "465691",
  database: "project_store",
})


module.exports = db