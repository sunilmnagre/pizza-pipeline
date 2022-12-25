'use strict';

const express = require('express');
const app = express();
const preparation = require('./services/preparation');
const fs = require('fs');

app.use(express.json());
app.use(express.static('logs'))
app.set('view engine', 'ejs');

// Route to get home page.
app.get('/', async (req, res) => {
    res.render('index');
});

// Route to get order from the home page
app.get('/order-process', async (req, res) => {
    // Trancate the log file before start process
    // We are storing logs into file for each queue, it must clear before the new process
    fs.truncate('./logs/reports.log', 0, function () { });

    // Prepare the ordered data to start
    let pizzas = [];
    for (let index = 0; index < req.query.q; index++) {
        pizzas.push({
            orderId: Math.floor(Math.random() * 5000),
            toppings: req.query.t
        });
    }

    // Start the process
    preparation.start(pizzas);
});

const port = process.env.PORT ?? 7085;
app.listen(port, () => {
    console.log(`Server started at port: ${port}`);
});