#!/usr/bin/env bash

npm install -g pnpm
npx @electron/rebuild@3.3.0 -f -w canvas
pnpm install