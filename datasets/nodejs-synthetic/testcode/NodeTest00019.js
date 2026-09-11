/**
 * XSS - Safe (escaped output with encodeURIComponent)
 * CWE-79: Cross-Site Scripting
 * Expected: SAFE
 */
const express = require('express');
const app = express();

app.get('/search', (req, res) => {
    const query = req.query.q;
    const safeQuery = encodeURIComponent(query);
    res.send('<h1>Results for: ' + safeQuery + '</h1>');
});
