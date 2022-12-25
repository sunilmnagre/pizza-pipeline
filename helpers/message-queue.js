'use_strict'

const amqp = require('amqplib');
const config = require('config');

/**
 * Create the connection
 * @return  Object
 */
const connect = async () => {
    try {
        const connection = await amqp.connect(config.settings.amqpURL);
        return connection;
    } catch (error) {
        console.log("error: ", error);
    }
}

module.exports = {
    connect
};

