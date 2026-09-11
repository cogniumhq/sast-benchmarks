/**
 * Code Injection - Vulnerable (eval)
 * CWE-94: Code Injection
 * Expected: VULNERABLE
 */
const express = require('express');
const app = express();

app.get('/calc', (req, res) => {
    const expr = req.query.expr;
    const result = eval(expr);
    res.json({ result });
});
