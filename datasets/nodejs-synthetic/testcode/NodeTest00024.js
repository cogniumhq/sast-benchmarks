/**
 * Code Injection - Vulnerable (Function constructor)
 * CWE-94: Code Injection
 * Expected: VULNERABLE
 */
const express = require('express');
const app = express();

app.post('/execute', (req, res) => {
    const code = req.body.code;
    const fn = new Function(code);
    const result = fn();
    res.json({ result });
});
