#! /usr/bin/env node

// @ts-check

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const child_process = require('child_process');

const process_args = process.argv;
console.log(`process_args: ${process_args}`);

const debug = process_args.includes('--debug');
console.log(`debug: ${debug}`);

const production = process_args.includes('--production');
console.log(`production: ${production}`);

const cwd = process.cwd();
console.log(`cwd: ${cwd}`);

/**
 * @param {string} command
 * @param {string[]} args
 * @returns {child_process.ChildProcess}
 */
const spawn = (command, args) => {
  assert(typeof command === 'string');
  assert(args instanceof Array);
  assert(args.every((arg) => typeof arg === 'string') === true);
  const spawned_process = child_process.spawn(command, args, { stdio: 'inherit' });
  spawned_process.on('error', (e) => {
    if (debug === true) {
      console.log({ command, event: 'error', error: e });
    }
  });
  spawned_process.on('close', (code, signal) => {
    if (debug === true) {
      console.log({ command, event: 'close', code, signal });
    }
  });
  spawned_process.on('exit', (code, signal) => {
    if (debug === true) {
      console.log({ command, event: 'exit', code, signal });
    }
  });
  return spawned_process;
};

/**
 * @param {child_process.ChildProcess} process
 * @returns {Promise<void>}
 */
const process_close_event = (process) => new Promise((resolve, reject) => {
  process.on('close', (code) => {
    if (code === 0) {
      resolve();
      return;
    }
    reject(new Error(`process_close_event, code ${code}`));
  });
});

process.nextTick(async () => {
  try {

    // ESBuild binary
    const esbuild_path = path.join(cwd, './node_modules/.bin/esbuild');
    assert(fs.existsSync(esbuild_path) === true);

    // PostCSS binary
    const postcss_path = path.join(cwd, './node_modules/.bin/postcss');
    assert(fs.existsSync(postcss_path) === true);

    // ESBuild entry
    const esbuild_entry_path = path.join(cwd, './client/src/esbuild.jsx');
    assert(fs.existsSync(esbuild_entry_path) === true, 'Invalid ESBuild entry.');

    // PostCSS entry
    const postcss_entry_path = path.join(cwd, './client/src/postcss.css');
    assert(fs.existsSync(postcss_entry_path) === true, 'Invalid PostCSS entry.');

    const esbuild_outfile = path.join(cwd, './client/dist/esbuild/esbuild.js');
    const postcss_outfile = path.join(cwd, './client/dist/postcss/postcss.css');

    if (production === true) {
      console.log('\n\n>> >> ESBuild..');
      await process_close_event(spawn(esbuild_path, [
        esbuild_entry_path,
        `--outfile=${esbuild_outfile}`,
        '--loader:.woff=file',
        '--loader:.woff2=file',
        '--asset-names=[name]',
        '--target=es6',
        '--sourcemap',
        '--bundle',
        '--minify',
      ]));
      console.log('\n\n>> >> PostCSS..');
      await process_close_event(spawn(postcss_path, [
        postcss_entry_path,
        `--output=${postcss_outfile}`,
        `--config=${cwd}`,
        '--verbose',
        '--production',
      ]));
    } else {
      console.log('\n\n>> >> ESBuild..');
      spawn(esbuild_path, [
        esbuild_entry_path,
        `--outfile=${esbuild_outfile}`,
        '--loader:.woff=file',
        '--loader:.woff2=file',
        '--asset-names=[name]',
        '--target=es6',
        '--sourcemap',
        '--bundle',
        '--watch',
      ]);
      console.log('\n\n>> >> PostCSS..');
      spawn(postcss_path, [
        postcss_entry_path,
        `--output=${postcss_outfile}`,
        `--config=${cwd}`,
        '--verbose',
        '--watch',
      ]);
    }
  } catch (e) {
    console.error(e);
  }
});