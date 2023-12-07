#!/usr/bin/env bash
set -euo pipefail

# Builds the app, outputting files ready for Netlify
# Flags:
# -n: Name of the network: 'Alfajores' or 'Mainnet'
# -e: Build for electron
# -v: Build for Vercel

NETWORK=""
ELECTRON=false
VERCEL=false

while getopts 'n:ev' flag; do
  case "${flag}" in
    n) NETWORK="$OPTARG" ;;
    e) ELECTRON=true ;;
    v) VERCEL=true ;;
    *) echo "Unexpected option ${flag}" ;;
  esac
done

[ -z "$NETWORK" ] && echo "Need to set the NETWORK via the -n flag" && exit 1;

xplat_sed () {
  sed -i'.bak' -e "$1" -- "$2"
  rm -- "${2}.bak"
}

echo "Cleaning first"
yarn run clean

echo "Building app for ${NETWORK}"

# Ensure right network config 
xplat_sed "s/freeze(config.*)/freeze(config${NETWORK})/g" src/config.ts

export NODE_ENV=production 
if [ "$ELECTRON" = true ]; then
  export BUILD_TARGET=electron
fi
yarn run webpack --mode production

echo "Checking bundle integrity"
export BUNDLE_HASH=`node scripts/shasum.js dist/bundle.js`
echo "Bundle hash ${BUNDLE_HASH}"
export LEDGER_BUNDLE_HASH=`node scripts/shasum.js dist/bundle-ledger.js`
echo "Ledger bundle hash ${LEDGER_BUNDLE_HASH}"
# export WC2_BUNDLE_HASH=`node scripts/shasum.js dist/bundle-walletconnectv2.js`
# echo "WalletConnect v2 bundle hash ${WC2_BUNDLE_HASH}"
echo "Updating index.html bundle hash"
xplat_sed "s|sha256-%BUNDLE_HASH%|sha256-${BUNDLE_HASH}|g" dist/index.html


if [ "$ELECTRON" = false ]; then
  echo "Prepping index.html for web" 
  # remove CSP header tag, it gets set via netlify header instead which is preferable
  xplat_sed "s|<meta http-equiv.*>||g" dist/index.html

  if [ "$VERCEL" = false ]; then
    echo "Updating Readme"
    xplat_sed "s|bundle.js -> sha256-.*\`|bundle.js -> sha256-${BUNDLE_HASH}\`|g" README.md
    xplat_sed "s|bundle-ledger.js -> sha256-.*\`|bundle-ledger.js -> sha256-${LEDGER_BUNDLE_HASH}\`|g" README.md
    # xplat_sed "s|bundle-walletconnectv2.js -> sha256-.*\`|bundle-walletconnectv2.js -> sha256-${WC2_BUNDLE_HASH}\`|g" README.md
  fi
else
  echo "Prepping index.html for electron" 
  # Trim title down 
  xplat_sed "s/ | Use Celo on the web or on your desktop//g" dist/index.html 
  # Replace absolute path with relative, absolute doesn't work
  xplat_sed "s|/bundle.js|bundle.js|g" dist/index.html
fi

if [ "$NETWORK" == "Alfajores" ]; then
  # Adjust CSP header for alfajores to allow for the config urls there
  xplat_sed "s|wss://walletconnect.celo.org|wss://walletconnect.celo-networks-dev.org https://*.celo-testnet.org|g" dist/_headers
fi

echo "Done building app for ${NETWORK}"