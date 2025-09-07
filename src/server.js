require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const { buildQueue } = require('./queue');
const { jobUploadDir, jobOutputPath, OUTPUT_DIR } = require('./utils/paths');

const app = express();
const PORT = Number(process.env.PORT || 4000);
const queue = buildQueue();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 50 } });

app.get('/health', (_req, res) => res.json({ name: 'filex-converter-api', status: 'up' }));

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const target = String(req.body.targetFormat || '').toLowerCase();
    if (!file) return res.status(400).json({ error: 'Campo "file" ausente' });
    if (!['pdf','csv','webp'].includes(target)) return res.status(400).json({ error: 'targetFormat inválido: use pdf|csv|webp' });

    const id = crypto.randomUUID();
    const uploadDir = jobUploadDir(id);
    await fs.mkdir(uploadDir, { recursive: true });
    const srcPath = path.join(uploadDir, file.originalname);
    await fs.writeFile(srcPath, file.buffer);

    await queue.add('convert', { id, srcPath, originalName: file.originalname, target }, { jobId: id });
    res.status(202).json({ jobId: id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao criar job' });
  }
});

app.get('/status/:id', async (req, res) => {
  try {
    const job = await queue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job não encontrado' });
    const state = await job.getState();

    let outputUrl = null, error = null;
    if (state === 'completed') {
      outputUrl = `/download/${job.id}`;
      try {
        const ext = job.data.target === 'pdf' ? 'pdf' : job.data.target === 'csv' ? 'csv' : 'webp';
        await fs.access(jobOutputPath(job.id, ext));
      } catch { outputUrl = null; }
    } else if (state === 'failed') {
      error = job.failedReason || 'Falha';
    }
    res.json({ id: job.id, state, outputUrl, error });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao checar status' });
  }
});

app.get('/download/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const job = await queue.getJob(id);
    if (!job) return res.status(404).json({ error: 'Job não encontrado' });
    const ext = job.data.target === 'pdf' ? 'pdf' : job.data.target === 'csv' ? 'csv' : 'webp';
    const filePath = jobOutputPath(id, ext);
    if (!filePath.startsWith(OUTPUT_DIR)) return res.status(400).json({ error: 'Caminho inválido' });
    const downloadName = `${path.basename(job.data.originalName, path.extname(job.data.originalName))}.${ext}`;
    res.download(filePath, downloadName);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro no download' });
  }
});

app.listen(PORT, () => console.log(`[API] listening on :${PORT}`));
