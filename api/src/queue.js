require('dotenv').config();
const { Queue } = require('bullmq');
const { REDIS_HOST='redis', REDIS_PORT=6379, QUEUE_NAME='filex_convert' } = process.env;
const connection = { host: REDIS_HOST, port: Number(REDIS_PORT) };
const queue = new Queue(QUEUE_NAME, { connection });
module.exports = { queue };
