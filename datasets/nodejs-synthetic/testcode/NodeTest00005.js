/**
 * SQL Injection - Vulnerable (req.query)
 * CWE-89: SQL Injection
 * Expected: VULNERABLE
 */
const express = require('express');
const mysql = require('mysql');
const app = express();
const db = mysql.createConnection({});

app.get('/search', (req, res) => {
    const q = req.query.q;
    const query = "SELECT * FROM items WHERE title = '" + q + "'";
    db.query(query, (err, results) => {
        res.json(results);
    });
});
