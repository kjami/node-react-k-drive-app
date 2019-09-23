/* global require, module */
const express = require('express');

const app = express();

app.use(express.json());

module.exports = app;