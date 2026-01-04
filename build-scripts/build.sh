#!/usr/bin/env bash

pnpm run build
mkdir -p public/resources
cp -r source/_posts public/resources/_posts
cp -r source/about public/resources/about
