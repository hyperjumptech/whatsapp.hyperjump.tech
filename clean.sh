#!/bin/bash

echo "Cleaning up the generated files and directories..."

# Remove all the node_modules, coverage, dist, build, .turbo, .cache, generated, and .next directories
find . -name "node_modules" -type d -exec rm -rf {} \;
find . -name "coverage" -type d -exec rm -rf {} \;
find . -name "dist" -type d -exec rm -rf {} \;
find . -name "build" -type d -exec rm -rf {} \;
find . -name ".next" -type d -exec rm -rf {} \;
find . -name ".turbo" -type d -exec rm -rf {} \;
find . -name ".cache" -type d -exec rm -rf {} \;
find . -name "generated" -type d -exec rm -rf {} \;

# Remove all the empty directories
find . -type d -empty -delete