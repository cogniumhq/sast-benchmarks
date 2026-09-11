/**
 * SQL Injection - Vulnerable (template literal)
 * CWE-89: SQL Injection
 * Expected: VULNERABLE
 */
const express = require('express');
const mysql = require('mysql');
const app = express();
const db = mysql.createConnection({});

app.post('/search', (req, res) => {
    const name = req.body.name;
    const query = `SELECT * FROM products WHERE name LIKE '%${name}%'`;
    db.query(query, (err, results) => {
        res.json(results);
    });
});
