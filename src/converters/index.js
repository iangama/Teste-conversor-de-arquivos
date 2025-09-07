const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const path = require('node:path');
const fs = require('node:fs/promises');
const XLSX = require('xlsx');
const sharp = require('sharp');

const pExecFile = promisify(execFile);

// LibreOffice headless
async function libreofficeConvert(inputPath, outDir, filter) {
  await pExecFile('soffice', ['--headless', '--convert-to', filter, '--outdir', outDir, inputPath], {
    maxBuffer: 1024 * 1024 * 20
  });
}

async function docxToPdf(inputPath, outputPath) {
  const outDir = path.dirname(outputPath);
  await fs.mkdir(outDir, { recursive: true });
  await libreofficeConvert(inputPath, outDir, 'pdf');
  const produced = path.join(outDir, path.basename(inputPath, path.extname(inputPath)) + '.pdf');
  if (produced !== outputPath) {
    try { await fs.rename(produced, outputPath); } catch {}
  }
  return outputPath;
}

async function xlsxToCsv(inputPath, outputPath) {
  const wb = XLSX.readFile(inputPath, { cellDates: true });
  const firstSheet = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheet];
  const csv = XLSX.utils.sheet_to_csv(ws);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, csv);
  return outputPath;
}

async function imageToWebp(inputPath, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(inputPath).webp().toFile(outputPath);
  return outputPath;
}

function pickConverter({ srcExt, target }) {
  const ext = srcExt.toLowerCase();
  if (target === 'pdf' && ext === '.docx') return docxToPdf;
  if (target === 'csv' && ext === '.xlsx') return xlsxToCsv;
  if (target === 'webp' && (ext === '.png' || ext === '.jpg' || ext === '.jpeg')) return imageToWebp;
  return null;
}

module.exports = { pickConverter };
