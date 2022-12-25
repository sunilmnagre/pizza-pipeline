'use strict';

const mq = require('../helpers/message-queue');
const config = require('../config/default');
const winston = require('winston');
const pipeline = config.pipeline;
const [currentQ, processingTime] = [pipeline.WAITER, config.timeRequired.waiter];

// Create a logger function with your desired settings
// It will help us to write a logs into file to generate report
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: './' + config.settings.logFilePath
        })
    ],
});

const deliver = async () => {
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

                preparedData.deliveryAt = new Date().toLocaleString();
                console.log("Delivered", preparedData);

                // Right log to report log file
                logger.info(preparedData);
            }, processingTime);
        }, { noAck: false });
    }
    catch (err) {
        console.warn(err);
    }
}

// As given, we have only one delivery service. Below line will create 1
deliver();