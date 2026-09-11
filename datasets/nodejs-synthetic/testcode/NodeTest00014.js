/**
 * Path Traversal - Safe (basename sanitization)
 * CWE-22: Path Traversal
 * Expected: SAFE
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.get('/download', (req, res) => {
    const file = req.query.file;
    const safeName = path.basename(file);
    const filepath = path.join('./uploads', safeName);
    fs.readFile(filepath, (err, data) => {
        res.send(data);
    });
});
