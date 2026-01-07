#!/usr/bin/env node
import { minify } from 'terser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputFile = path.join(__dirname, 'flysplatter/assets/js/flysplatter.js');
const outputFile = path.join(__dirname, 'flysplatter/dist/js/flysplatter.min.js');

// Global variable names that must be preserved during minification
// These are exposed as public API for external projects
const RESERVED_NAMES = ['Flies', 'Fly', 'iOS', 'score', 'debug', 'docReady', 'trackEvent'];

async function build() {
  try {
    console.log('Reading source file...');
    const code = await fs.readFile(inputFile, 'utf8');
    
    console.log('Minifying...');
    const result = await minify(code, {
      compress: {
        drop_console: false,
        drop_debugger: true
      },
      mangle: {
        reserved: RESERVED_NAMES
      },
      format: {
        comments: false
      }
    });
    
    if (result.error) {
      throw result.error;
    }
    
    console.log('Writing output file...');
    await fs.writeFile(outputFile, result.code);
    
    const stats = await fs.stat(outputFile);
    console.log(`✓ Built successfully: ${outputFile} (${stats.size} bytes)`);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
