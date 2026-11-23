import { appendFileSync } from 'node:fs';

const payloadRaw = process.env.INPUT_PAYLOAD;
const outputPath = process.env.GITHUB_OUTPUT;

let parsed;
try {
  parsed = JSON.parse(payloadRaw);
} catch {
  throw new Error('Invalid input');
}

if (
  !parsed ||
  typeof parsed !== 'object' ||
  Array.isArray(parsed) ||
  !Array.isArray(parsed.records) ||
  typeof parsed.field !== 'string' ||
  parsed.field.length === 0
) {
  throw new Error('Invalid input');
}

const { records, field } = parsed;

let total = records.length;
let missing = 0;
let nulls = 0;
let present = 0;

for (let i = 0; i < records.length; i++) {
  const rec = records[i];
  if (
    !rec ||
    typeof rec !== 'object' ||
    Array.isArray(rec) ||
    Object.getPrototypeOf(rec) !== Object.prototype
  ) {
    throw new Error('Invalid input');
  }

  if (Object.prototype.hasOwnProperty.call(rec, field)) {
    present++;
    if (rec[field] === null) nulls++;
  } else {
    missing++;
  }
}

const result = JSON.stringify({ missing, nulls, present, total });
appendFileSync(outputPath, `result=${result}\n`);