/**
 * Path Traversal - Vulnerable (direct file access)
 * CWE-22: Path Traversal
 * Expected: VULNERABLE
 */
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/files/:name', (req, res) => {
    const filename = req.params.name;
    fs.readFile('./uploads/' + filename, (err, data) => {
        res.send(data);
    });
});
