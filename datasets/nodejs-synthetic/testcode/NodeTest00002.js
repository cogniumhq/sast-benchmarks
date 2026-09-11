/**
 * SQL Injection - Safe (parameterized query)
 * CWE-89: SQL Injection
 * Expected: SAFE
 */
const express = require('express');
const mysql = require('mysql');
const app = express();
const db = mysql.createConnection({});

app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [id], (err, results) => {
        res.json(results);
    });
});
