'use strict';

const dough = require('./dough');

const start = (pizzas) => {
    // This is the very first step to create a Pizza
    // Start the received order to dough queue
    dough.start(pizzas);
};

module.exports = { start };