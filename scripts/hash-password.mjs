// Usage: node scripts/hash-password.mjs   (prompts; nothing is stored). Paste output into Netlify env WEIGHT_PASSWORD_HASH.
import { hashPassword } from '../netlify/lib/weight.mjs';
import { createInterface } from 'node:readline'; import { randomBytes } from 'node:crypto';
const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question('Weight calculator password: ', pw => { rl.close(); if (!pw) process.exit(1);
  console.log('\nWEIGHT_PASSWORD_HASH=' + hashPassword(pw)); console.log('WEIGHT_TOKEN_SECRET=' + randomBytes(32).toString('hex')); });
