/**
 * Command Injection - Safe (constant command)
 * CWE-78: Command Injection
 * Expected: SAFE
 */
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.get('/uptime', (req, res) => {
    exec('uptime', (error, stdout) => {
        res.send(stdout);
    });
});
