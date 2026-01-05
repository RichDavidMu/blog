#!/usr/bin/env bash

pnpm run build
mkdir -p public/source
cp -r source public/source
