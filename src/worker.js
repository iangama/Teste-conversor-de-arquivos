require('dotenv').config();
const path = require('node:path');
const { buildWorker } = require('./queue');
const { pickConverter } = require('./converters');
const { jobOutputPath } = require('./utils/paths');

const worker = buildWorker(async (job) => {
  const { id, srcPath, originalName, target } = job.data || {};
  if (!id || !srcPath || !target) throw new Error('Dados do job inválidos');

  const srcExt = path.extname(srcPath);
  const converter = pickConverter({ srcExt, target });
  if (!converter) throw new Error(`Conversão não suportada: ${srcExt} → ${target}`);

  const outExt = target === 'pdf' ? 'pdf' : target === 'csv' ? 'csv' : 'webp';
  const outPath = jobOutputPath(id, outExt);
  await converter(srcPath, outPath);
  return { outPath, originalName, target };
});

worker.on('completed', (job) => console.log(`[Worker] ok ${job.id}`));
worker.on('failed', (job, err) => console.error(`[Worker] fail ${job?.id}: ${err?.message}`));
