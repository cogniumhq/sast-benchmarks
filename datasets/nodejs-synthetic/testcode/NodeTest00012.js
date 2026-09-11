/**
 * Path Traversal - Safe (constant path)
 * CWE-22: Path Traversal
 * Expected: SAFE
 */
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/readme', (req, res) => {
    fs.readFile('./public/README.md', (err, data) => {
        res.send(data);
    });
});
