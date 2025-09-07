const path = require('node:path');
require('dotenv').config();

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../storage/uploads');
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.resolve(__dirname, '../../storage/outputs');
const TMP_DIR = process.env.TMP_DIR || path.resolve(__dirname, '../../storage/tmp');

function jobUploadDir(jobId){ return path.join(UPLOAD_DIR, jobId); }
function jobOutputPath(jobId, targetExt){ return path.join(OUTPUT_DIR, `${jobId}.${targetExt}`); }

module.exports = { UPLOAD_DIR, OUTPUT_DIR, TMP_DIR, jobUploadDir, jobOutputPath };
