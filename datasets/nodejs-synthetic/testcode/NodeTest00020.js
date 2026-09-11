/**
 * XSS - Vulnerable (innerHTML equivalent with res.write)
 * CWE-79: Cross-Site Scripting
 * Expected: VULNERABLE
 */
const express = require('express');
const app = express();

app.get('/profile', (req, res) => {
    const bio = req.query.bio;
    res.write('<div class="bio">');
    res.write(bio);
    res.write('</div>');
    res.end();
});
