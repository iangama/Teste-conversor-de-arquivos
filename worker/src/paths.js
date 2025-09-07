require('dotenv').config();
const path = require('node:path');

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/storage/uploads';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/app/storage/outputs';

function jobOutputPath(jobId, targetExt){ return path.join(OUTPUT_DIR, `${jobId}.${targetExt}`); }

module.exports = { UPLOAD_DIR, OUTPUT_DIR, jobOutputPath };
