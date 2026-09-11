/**
 * Command Injection - Safe (execFile with args array)
 * CWE-78: Command Injection
 * Expected: SAFE
 */
const express = require('express');
const { execFile } = require('child_process');
const app = express();

app.get('/ping', (req, res) => {
    const host = req.query.host;
    execFile('ping', ['-c', '1', host], (error, stdout) => {
        res.send(stdout);
    });
});
