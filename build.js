#!/usr/bin/env node
import { minify } from 'terser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputFile = path.join(__dirname, 'flysplatter/assets/js/flysplatter.js');
const outputFile = path.join(__dirname, 'flysplatter/dist/js/flysplatter.min.js');

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
        // Preserve important global names
        reserved: ['Flies', 'Fly', 'iOS', 'score', 'debug', 'docReady', 'trackEvent']
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
