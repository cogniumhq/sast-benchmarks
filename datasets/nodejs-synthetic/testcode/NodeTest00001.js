/**
 * SQL Injection - Vulnerable (string concatenation)
 * CWE-89: SQL Injection
 * Expected: VULNERABLE
 */
const express = require('express');
const mysql = require('mysql');
const app = express();
const db = mysql.createConnection({});

app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    const query = "SELECT * FROM users WHERE id = " + id;
    db.query(query, (err, results) => {
        res.json(results);
    });
});
