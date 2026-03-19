#!/usr/bin/env node
/*
 * Copyright (c) 2026 Talon Contributors
 * Author: dark.lijin@gmail.com
 * Licensed under the Talon Community Dual License Agreement.
 * See the LICENSE file in the project root for full license information.
 */
/**
 * Talon EvoCore Node.js SDK — postinstall script.
 * Downloads the platform-specific native library from GitHub Releases.
 */

'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const REPO = 'darkmice/talon-bin';
const VERSION = require('../package.json').version;

function platformInfo() {
  const plat = os.platform();
  const arch = os.arch();

  let libName, releaseName;
  if (plat === 'darwin') {
    libName = 'libevocore.dylib';
    releaseName = `evocore-macos-${arch === 'arm64' ? 'arm64' : 'amd64'}`;
  } else if (plat === 'win32') {
    libName = 'evocore.dll';
    releaseName = 'evocore-windows-amd64';
  } else {
    libName = 'libevocore.so';
    let a = 'amd64';
    if (arch === 'arm64') a = 'arm64';
    else if (arch === 'loong64') a = 'loongarch64';
    else if (arch === 'riscv64') a = 'riscv64';
    releaseName = `evocore-linux-${a}`;
  }

  return { libName, releaseName };
}

function download(url, dest, redirects = 0) {
  const MAX_REDIRECTS = 5;
  return new Promise((resolve, reject) => {
    const proxy = process.env.https_proxy || process.env.HTTPS_PROXY ||
                  process.env.http_proxy || process.env.HTTP_PROXY;

    if (proxy) {
      try {
        execSync(`curl -fSL --retry 3 -o "${dest}" "${url}"`, {
          stdio: 'inherit',
          env: { ...process.env }
        });
        return resolve();
      } catch (e) {
        return reject(new Error(`curl failed: ${e.message}`));
      }
    }

    const get = url.startsWith('https:') ? https.get : http.get;
    get(url, { headers: { 'User-Agent': 'evocore-nodejs-sdk' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirects >= MAX_REDIRECTS) {
          return reject(new Error(`Too many redirects (>${MAX_REDIRECTS})`));
        }
        return download(res.headers.location, dest, redirects + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  // Skip if EVOCORE_LIB_PATH is set
  if (process.env.EVOCORE_LIB_PATH && fs.existsSync(process.env.EVOCORE_LIB_PATH)) {
    console.log('[evocore] Using EVOCORE_LIB_PATH:', process.env.EVOCORE_LIB_PATH);
    return;
  }

  const { libName, releaseName } = platformInfo();
  const nativeDir = path.join(__dirname, '..', 'native');

  // Skip if already present
  const libPath = path.join(nativeDir, libName);
  if (fs.existsSync(libPath)) {
    console.log('[evocore] Native library already present:', libPath);
    return;
  }

  const archiveName = `libevocore-${releaseName}.tar.gz`;
  const url = `https://github.com/${REPO}/releases/download/v${VERSION}/${archiveName}`;
  const archivePath = path.join(nativeDir, archiveName);

  console.log(`[evocore] Downloading native library v${VERSION} for ${releaseName}...`);
  fs.mkdirSync(nativeDir, { recursive: true });

  try {
    await download(url, archivePath);
    execSync(`tar -xzf "${archivePath}" -C "${nativeDir}"`, { stdio: 'inherit' });
    fs.unlinkSync(archivePath);

    if (fs.existsSync(libPath)) {
      console.log(`[evocore] Native library ready: ${libPath}`);
    } else {
      console.warn(`[evocore] Warning: ${libName} not found after extraction`);
    }
  } catch (err) {
    console.warn(`[evocore] Failed to download native library: ${err.message}`);
    console.warn('[evocore] You can manually set EVOCORE_LIB_PATH to the library location.');
    if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);
  }
}

main().catch(console.error);
