/**
 * Code Injection - Safe (constant eval - still bad practice but not user-controlled)
 * CWE-94: Code Injection
 * Expected: SAFE
 */
const express = require('express');
const app = express();

app.get('/version', (req, res) => {
    const result = eval('2 + 2');
    res.json({ result });
});
