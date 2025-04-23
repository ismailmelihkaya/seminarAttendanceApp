const sql = require('mssql');;
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options : {
        trustServerCertificate: true
    }
};

module.exports = { sql, config };