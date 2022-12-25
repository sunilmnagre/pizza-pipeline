'use strict';

const mq = require('../helpers/message-queue');
const topping = require('./topping');
const config = require('../config/default');
const pipeline = config.pipeline;
const [currentQ, nextQ, processingTime] = [pipeline.DOUGH, pipeline.TOPPING, config.timeRequired.dough];

const start = async (pizzas) => {
    let connection;
    try {
        let pizzaData = {};
        // Let's connect to MessageQ 
        connection = await mq.connect();

        // Create a channel
        const channel = await connection.createChannel();

        // Create a new queue
        await channel.assertQueue(currentQ, { durable: true });

        for (let index = 0; index < pizzas.length; index++) {
            // Prepare the data before sending to the queue
            pizzaData.startTime = new Date().toLocaleString();
            pizzaData.orderId = pizzas[index].orderId;
            pizzaData.toppings = pizzas[index].toppings;

            // Final send the data to queue
            // Doughs will consume the queue data
            channel.sendToQueue(currentQ, Buffer.from(JSON.stringify(pizzaData)), { persistent: true });
        }
        await channel.close();
    } catch (err) {
        console.error(err);
    } finally {
        // Need to wait for sometime to close the connection
        setTimeout(async () => {
            await connection.close();
        }, 500);
    };
}

const getDoughReady = async () => {
    let connection;
    try {
        // Let's connect to MessageQ 
        connection = await mq.connect();

        // Create a channel
        const channel = await connection.createChannel();

        // Create a new queue
        await channel.assertQueue(currentQ, { durable: true });

        // IMPORTANT: It will send one job to one consumer
        channel.prefetch(1);

        await channel.consume(currentQ, (message) => {
            let preparedData = JSON.parse(message.content);
            setTimeout(() => {
                // Acknowledge that you have received the message
                channel.ack(message);

                preparedData.doughDoneAt = new Date().toLocaleString();
                console.log("Dough Finished", preparedData);

                // Send the prepared data (i.e dough) to next queue (i.e topping)
                channel.sendToQueue(nextQ, Buffer.from(JSON.stringify(preparedData)), { persistent: true });
            }, processingTime);
        }, { noAck: false });
    } catch (err) {
        console.error(err);
    }
}

// As given in the requirement, We have 2 (two) dough, so need to create two consumers
getDoughReady();
getDoughReady();

module.exports = { start };

