// Usage: node scripts/hash-password.mts
// Prompts for the weight-calculator password (nothing is stored) and prints the two env vars to set in Netlify.
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import { hashPassword } from "../netlify/lib/weight.mts";

const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question("Weight calculator password: ", (pw) => {
  rl.close();
  if (!pw) process.exit(1);
  console.log(`\nWEIGHT_PASSWORD_HASH=${hashPassword(pw)}`);
  console.log(`WEIGHT_TOKEN_SECRET=${randomBytes(32).toString("hex")}`);
});
