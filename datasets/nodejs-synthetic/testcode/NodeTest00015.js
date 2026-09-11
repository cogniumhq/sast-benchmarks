/**
 * Path Traversal - Vulnerable (writeFile)
 * CWE-22: Path Traversal
 * Expected: VULNERABLE
 */
const express = require('express');
const fs = require('fs');
const app = express();

app.post('/upload', (req, res) => {
    const filename = req.body.filename;
    const content = req.body.content;
    fs.writeFile('./uploads/' + filename, content, (err) => {
        res.send('Saved');
    });
});
