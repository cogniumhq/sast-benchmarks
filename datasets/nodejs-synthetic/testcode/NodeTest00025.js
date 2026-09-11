/**
 * SSRF - Vulnerable (request to user-controlled URL)
 * CWE-918: Server-Side Request Forgery
 * Expected: VULNERABLE
 */
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/fetch', async (req, res) => {
    const url = req.query.url;
    const response = await axios.get(url);
    res.json(response.data);
});
