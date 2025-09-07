require('dotenv').config();
const { Queue, Worker } = require('bullmq');
const { REDIS_HOST='redis', REDIS_PORT=6379, QUEUE_NAME='filex:convert' } = process.env;
const connection = { host: REDIS_HOST, port: Number(REDIS_PORT) };

function buildQueue() { return new Queue(QUEUE_NAME, { connection }); }
function buildWorker(processor) { return new Worker(QUEUE_NAME, processor, { connection }); }

module.exports = { buildQueue, buildWorker, connection };
