'use strict';

const mq = require('../helpers/message-queue');
const waiter = require('./waiter');
const config = require('../config/default');
const pipeline = config.pipeline;

const [currentQ, nextQ, processingTime] = [pipeline.OVEN, pipeline.WAITER, config.timeRequired.oven];

const cook = async () => {
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

                preparedData.cookedAt = new Date().toLocaleString();
                console.log("Cooking Finished", preparedData);

                // Send the prepared data (i.e cooked pizza) to next queue (i.e waiter)
                channel.sendToQueue(nextQ, Buffer.from(JSON.stringify(preparedData)), { persistent: true });
            }, processingTime);
        }, { noAck: false });
    }
    catch (err) {
        console.warn(err);
    }
}

// As given, we have only one oven. Below will create 1 cooking consumer
cook();