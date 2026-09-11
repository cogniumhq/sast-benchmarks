/**
 * SQL Injection - Safe (constant query)
 * CWE-89: SQL Injection
 * Expected: SAFE
 */
const express = require('express');
const mysql = require('mysql');
const app = express();
const db = mysql.createConnection({});

app.get('/products', (req, res) => {
    const query = "SELECT * FROM products WHERE active = 1";
    db.query(query, (err, results) => {
        res.json(results);
    });
});
