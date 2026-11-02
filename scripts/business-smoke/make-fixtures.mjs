import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { lstat, mkdir, open, readFile, link } from 'node:fs/promises';

const PAGE_COUNT = 6;
const PAGE_SIZE = [612, 792];
const FIXED_DATE = '2026-10-30T00:00:00.000Z';
const OUTPUT_DIRECTORY = fileURLToPath(new URL('../../tests/fixtures/business/', import.meta.url));
const OUTPUT_PATH = join(OUTPUT_DIRECTORY, 'report.pdf');
const TEMP_PATH = `${OUTPUT_PATH}.tmp`;
let phase = 'arguments';

function validatePdf(bytes) {
  assert.equal(bytes.subarray(0, 5).toString('ascii'), '%PDF-');
  const text = bytes.toString('latin1');
  assert.match(text, /%%EOF\s*$/);
  const objects = [...text.matchAll(/\b\d+\s+\d+\s+obj\b([\s\S]*?)\bendobj\b/g)].map(match => match[1]);
  const trees = objects.filter(object => /\/Type\s*\/Pages\b/.test(object));
  assert.equal(trees.length, 1, 'Expected one PDF page tree');
  assert.match(trees[0], /\/Count\s+6\b/);
  const children = trees[0].match(/\/Kids\s*\[([^\]]*)\]/);
  assert.ok(children, 'Expected PDF page-tree children');
  assert.equal([...children[1].matchAll(/\b\d+\s+\d+\s+R\b/g)].length, PAGE_COUNT);
  assert.equal(objects.filter(object => /\/Type\s*\/Page\b/.test(object)).length, PAGE_COUNT);
}

async function generatePdf() {
  const PDFDocument = createRequire(import.meta.url)('pdfkit');
  const document = new PDFDocument({
    size: PAGE_SIZE,
    autoFirstPage: false,
    bufferPages: true,
    compress: false,
    info: {
      Title: 'Blurby Business fixture',
      Author: 'Blurby',
      Creator: 'Blurby fixture generator',
      Producer: 'Blurby fixture generator',
      CreationDate: new Date(FIXED_DATE),
      ModDate: new Date(FIXED_DATE),
    },
  });
  const chunks = [];
  const completed = new Promise((resolve, reject) => {
    document.on('data', chunk => chunks.push(chunk));
    document.once('error', reject);
    document.once('end', () => resolve(Buffer.concat(chunks)));
  });
  try {
    for (let pageNumber = 1; pageNumber <= PAGE_COUNT; pageNumber += 1) {
      document.addPage({ size: PAGE_SIZE });
      document.font('Helvetica').fontSize(18).text('Blurby Business fixture', 72, 72);
      document.fontSize(12).text(`Page ${pageNumber} of ${PAGE_COUNT}`, 72, 108);
      if (pageNumber === 2) {
        document.fontSize(12).text('Quarterly results', 72, 144);
      }
      if (pageNumber === 1) {
        document.rect(72, 180, 144, 72).fill('black');
      }
    }
    assert.equal(document.bufferedPageRange().count, PAGE_COUNT);
    document.end();
  } catch (error) {
    document.destroy(error);
  }
  const bytes = await completed;
  validatePdf(bytes);
  return bytes;
}

async function inspect(outputPath) {
  try {
    return await lstat(outputPath);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function assertIdentical(outputPath, entry, bytes) {
  assert.ok(entry.isFile() && !entry.isSymbolicLink(), `Unsafe existing output: ${outputPath}`);
  assert.ok((await readFile(outputPath)).equals(bytes), `Existing output differs: ${outputPath}`);
}

async function publish(bytes) {
  phase = 'inspect outputs';
  const finalEntry = await inspect(OUTPUT_PATH);
  const tempEntry = await inspect(TEMP_PATH);
  if (finalEntry) {
    await assertIdentical(OUTPUT_PATH, finalEntry, bytes);
    if (tempEntry) await assertIdentical(TEMP_PATH, tempEntry, bytes);
    return 'unchanged';
  }
  assert.equal(tempEntry, null, 'Existing temporary output without an accepted final output');
  phase = 'create output directory';
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  phase = 'create temporary output';
  const handle = await open(TEMP_PATH, 'wx');
  try {
    phase = 'write temporary output';
    await handle.writeFile(bytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
  phase = 'read back temporary output';
  assert.ok((await readFile(TEMP_PATH)).equals(bytes), 'Temporary output readback differs');
  phase = 'link final output';
  await link(TEMP_PATH, OUTPUT_PATH);
  phase = 'read back final output';
  assert.ok((await readFile(OUTPUT_PATH)).equals(bytes), 'Final output readback differs');
  return 'created';
}

try {
  assert.equal(process.argv.length, 2, 'This generator accepts no arguments');
  phase = 'generate complete PDF';
  const bytes = await generatePdf();
  const status = await publish(bytes);
  process.stdout.write(`Business report fixture ${status}: ${PAGE_COUNT} pages, ${bytes.length} bytes\n`);
} catch (error) {
  process.stderr.write(`Business report fixture failed during ${phase}: ${error.message}\n`);
  process.exitCode = 1;
}
