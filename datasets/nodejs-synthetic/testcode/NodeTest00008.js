/**
 * Command Injection - Vulnerable (template literal)
 * CWE-78: Command Injection
 * Expected: VULNERABLE
 */
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.post('/convert', (req, res) => {
    const filename = req.body.filename;
    exec(`convert ${filename} output.png`, (error, stdout) => {
        res.send('Converted');
    });
});
