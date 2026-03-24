#!/usr/bin/env node
// Generates placeholder PNG icons for the Chrome extension.
// These are simple colored squares with "B" — replace with real branding assets.
// Run: node chrome-extension/icons/generate-icons.js

const fs = require("fs");
const path = require("path");

// Minimal 1-bit PNG generator for solid-color placeholder icons
// Real icons should be designed properly and replace these.

function createPlaceholderPng(size) {
  // Create a simple PNG with the Blurby orange (#D04716) background
  // This is a minimal valid PNG — just a solid color rectangle
  const width = size;
  const height = size;

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk("IHDR", ihdrData);

  // IDAT chunk — uncompressed image data
  // Each row: filter byte (0) + RGB pixels
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);
  // Blurby orange: #D04716 = (208, 71, 22)
  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const offset = y * rowSize + 1 + x * 3;
      rawData[offset] = 208;     // R
      rawData[offset + 1] = 71;  // G
      rawData[offset + 2] = 22;  // B
    }
  }

  // Compress with zlib (deflate)
  const zlib = require("zlib");
  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk("IDAT", compressed);

  // IEND chunk
  const iend = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuffer, data]);

  // CRC32
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < crcInput.length; i++) {
    crc ^= crcInput[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  crc = (crc ^ 0xFFFFFFFF) >>> 0;

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

const sizes = [16, 48, 128];
const dir = path.dirname(__filename || __dirname);

for (const size of sizes) {
  const png = createPlaceholderPng(size);
  const outPath = path.join(__dirname, `icon-${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Generated ${outPath} (${size}x${size}, ${png.length} bytes)`);
}

console.log("\nThese are solid-color placeholders. Replace with branded icons before publishing.");
