'use strict';

const mq = require('../helpers/message-queue');
const oven = require('./oven');
const config = require('../config/default');
const pipeline = config.pipeline;

const [currentQ, nextQ] = [pipeline.TOPPING, pipeline.OVEN];

const getToppingReady = async () => {
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
            let actualProcessingTime = 0;
            let preparedData = JSON.parse(message.content);

            // Calculate the actual processing time for the topping
            // 3 is the number of chef, who are doing this job
            let workDivided = Math.ceil(preparedData.toppings / 3);
            if (workDivided <= 3) {
                workDivided = 2;
            }

            // As we have 4000 (4 seconds) that one Chef takes to complete 2 toppings
            actualProcessingTime = workDivided * 2 * 1000;

            setTimeout(() => {
                // Acknowledge that you have received the message
                channel.ack(message);

                preparedData.toppingDoneAt = new Date().toLocaleString();
                console.log("Topping Finished", preparedData);

                // Send the prepared data (i.e toppings) to next queue (i.e oven)
                channel.sendToQueue(nextQ, Buffer.from(JSON.stringify(preparedData)), { persistent: true });
            }, actualProcessingTime);
        }, { noAck: false });
    }
    catch (err) {
        console.error(err);
    }
}

// As given, we have 3 topping chefs, creating 3 consumers for it
getToppingReady();
getToppingReady();
getToppingReady();