/**
 * XSS - Safe (constant HTML)
 * CWE-79: Cross-Site Scripting
 * Expected: SAFE
 */
const express = require('express');
const app = express();

app.get('/about', (req, res) => {
    res.send('<h1>About Us</h1><p>Welcome to our site.</p>');
});
