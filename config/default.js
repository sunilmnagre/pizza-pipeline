'use strict';

module.exports = {
    settings: {
        amqpURL: 'amqp://sunil:admin@messageq:5672',
        logFilePath: 'logs/reports.log'
    },
    pipeline: {
        DOUGH: "DOUGH",
        TOPPING: "TOPPING",
        OVEN: "OVEN",
        WAITER: "WAITER"
    },
    timeRequired: {
        dough: 7000,
        toppings: 4000,
        oven: 10000,
        waiter: 5000
    }
};