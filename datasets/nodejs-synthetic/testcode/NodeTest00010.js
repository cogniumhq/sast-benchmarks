/**
 * Command Injection - Vulnerable (spawn with shell)
 * CWE-78: Command Injection
 * Expected: VULNERABLE
 */
const express = require('express');
const { spawn } = require('child_process');
const app = express();

app.get('/run', (req, res) => {
    const cmd = req.query.cmd;
    const child = spawn(cmd, { shell: true });
    child.stdout.on('data', (data) => {
        res.send(data.toString());
    });
});
