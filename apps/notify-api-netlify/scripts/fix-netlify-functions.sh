#! /bin/bash

# This script is used to remove the generated .d.* files in the netlify functions folder

rm -rf src/netlify/functions/*.d.*
rm -rf dist/src/netlify/functions/*.d.*