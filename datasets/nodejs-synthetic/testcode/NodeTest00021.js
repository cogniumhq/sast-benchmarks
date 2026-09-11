/**
 * NoSQL Injection - Vulnerable (MongoDB query)
 * CWE-943: NoSQL Injection
 * Expected: VULNERABLE
 */
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();

app.get('/users', async (req, res) => {
    const client = await MongoClient.connect('mongodb://localhost');
    const db = client.db('test');
    const username = req.query.username;
    const query = { username: username };
    const users = await db.collection('users').find(query).toArray();
    res.json(users);
});
