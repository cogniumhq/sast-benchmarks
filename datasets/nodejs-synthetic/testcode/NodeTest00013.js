/**
 * Path Traversal - Vulnerable (path.join doesn't prevent traversal)
 * CWE-22: Path Traversal
 * Expected: VULNERABLE
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.get('/download', (req, res) => {
    const file = req.query.file;
    const filepath = path.join('./uploads', file);
    fs.readFile(filepath, (err, data) => {
        res.send(data);
    });
});
