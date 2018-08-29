const path = require('path')

const CWD = process.cwd()
const PACKAGE = require(path.join(CWD, 'package.json'))
const serviceWorkerFilename = 'service-worker.js';

const addAssetsToSWFile = async ({name, bundler}) => {

  if (name && name.endsWith(serviceWorkerFilename)) {
    const assets = [...bundler.bundleHashes.entries()]
    .filter(([filename]) =>
      [".map", serviceWorkerFilename].every(suffix => !filename.endsWith(suffix))
    );
    const filenames = assets
      .map(([filename]) => path.join(bundler.options.publicURL, path.relative(bundler.options.outDir, filename)))
    const hashes = assets.map(([_, hash]) => hash).join(":");
    return {
      header: `
      const assets = ${JSON.stringify(filenames)};
      const cacheName = "offline-cache";`,
      footer: `//*invalidator:${hashes}`
    }
  }
}

module.exports = addAssetsToSWFile;
