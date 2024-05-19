import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { Transform } from 'stream';
import { Command } from 'commander';

const program = new Command();

const asyncPipeline = promisify(pipeline);

program
  .option('-i, --input <path>', 'input file')
  .option('-o, --output <path>', 'output file')
  .option('-t, --task <task>', 'task to perform', 'dup')
  .parse(process.argv);

const options = program.opts();

function removeConsecutiveDuplicates(str) {
  return str.replace(/(.)\1+/g, '$1');
}

function processArray(arr) {
  return arr.map(removeConsecutiveDuplicates);
}

const transformStream = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    try {
      const input = JSON.parse(chunk.toString());
      const result = processArray(input);
      callback(null, JSON.stringify(result));
    } catch (err) {
      callback(err);
    }
  }
});

async function main() {
  const inputStream = options.input ? fs.createReadStream(options.input) : process.stdin;
  const outputStream = options.output ? fs.createWriteStream(options.output) : process.stdout;

  try {
    await asyncPipeline(
      inputStream,
      transformStream,
      outputStream
    );
    console.log('Processing completed successfully.');
  } catch (err) {
    console.error('Processing failed:', err);
    process.exit(1);
  }
}

main();