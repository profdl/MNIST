// Download and save a sample of MNIST images as PNGs
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const zlib = require('zlib');
const { PNG } = require('pngjs');

const MNIST_IMAGE_URL = 'https://raw.githubusercontent.com/fgnt/mnist/master/train-images-idx3-ubyte.gz';
const MNIST_LABEL_URL = 'https://raw.githubusercontent.com/fgnt/mnist/master/train-labels-idx1-ubyte.gz';
const OUTPUT_DIR = path.join(__dirname, '../public/mnist-sample');
const SAMPLE_SIZE = 1000;

async function downloadAndExtract(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const buffer = await res.buffer();
  return zlib.gunzipSync(buffer);
}

function parseImages(buffer, count) {
  const magic = buffer.readUInt32BE(0);
  const numImages = buffer.readUInt32BE(4);
  const numRows = buffer.readUInt32BE(8);
  const numCols = buffer.readUInt32BE(12);
  const images = [];
  let offset = 16;
  for (let i = 0; i < count; i++) {
    const pixels = [];
    for (let j = 0; j < numRows * numCols; j++) {
      pixels.push(buffer.readUInt8(offset++));
    }
    images.push(pixels);
  }
  return { images, numRows, numCols };
}

function parseLabels(buffer, count) {
  const magic = buffer.readUInt32BE(0);
  const numLabels = buffer.readUInt32BE(4);
  const labels = [];
  let offset = 8;
  for (let i = 0; i < count; i++) {
    labels.push(buffer.readUInt8(offset++));
  }
  return labels;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('Downloading MNIST images...');
  const imgBuffer = await downloadAndExtract(MNIST_IMAGE_URL);
  console.log('Downloading MNIST labels...');
  const labelBuffer = await downloadAndExtract(MNIST_LABEL_URL);
  const { images, numRows, numCols } = parseImages(imgBuffer, SAMPLE_SIZE);
  const labels = parseLabels(labelBuffer, SAMPLE_SIZE);

  const meta = [];
  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const png = new PNG({ width: numCols, height: numRows, colorType: 0 });
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        const idx = (y * numCols + x);
        const val = images[i][idx];
        const pngIdx = (y * numCols + x) << 2;
        png.data[pngIdx] = val;
        png.data[pngIdx + 1] = val;
        png.data[pngIdx + 2] = val;
        png.data[pngIdx + 3] = 255;
      }
    }
    const outPath = path.join(OUTPUT_DIR, `${i}.png`);
    png.pack().pipe(fs.createWriteStream(outPath));
    meta.push({ index: i, label: labels[i], file: `${i}.png` });
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2));
  console.log('Done!');
}

main().catch(console.error); 