#!/usr/bin/env node
import {run} from './install.mjs';
run(['--check-updates', ...process.argv.slice(2)]).catch(error => {
  console.error(`GPT with Taste: ${error.message}`);
  process.exitCode = 1;
});
