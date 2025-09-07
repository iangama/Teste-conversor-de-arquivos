require('dotenv').config();
const path = require('node:path');
const { Worker } = require('bullmq');
const { pickConverter } = require('./converters');
const { jobOutputPath } = require('./paths');

const { REDIS_HOST='redis', REDIS_PORT=6379, QUEUE_NAME='filex_convert' } = process.env;
const connection = { host: REDIS_HOST, port: Number(REDIS_PORT) };

const w = new Worker(QUEUE_NAME, async (job)=>{
  const { id, srcPath, originalName, target } = job.data || {};
  if(!id || !srcPath || !target) throw new Error('Dados do job inválidos');

  const srcExt = path.extname(srcPath);
  const converter = pickConverter({ srcExt, target });
  if(!converter) throw new Error(`Conversão não suportada: ${srcExt} → ${target}`);

  const outExt = target==='pdf'?'pdf':target==='csv'?'csv':'webp';
  const outPath = jobOutputPath(id, outExt);
  await converter(srcPath, outPath);
  return { outPath, originalName, target };
}, { connection });

w.on('completed', (job)=> console.log(`[Worker] ok ${job.id}`));
w.on('failed', (job, err)=> console.error(`[Worker] fail ${job?.id}: ${err?.message}`));
