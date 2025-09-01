#! /bin/bash

# Find all index.html files inside a coverage directory in the current directory and its subdirectories, log them out, and open them in the browser
coverage_files=$(find . -path "*/coverage/index.html")
echo "Coverage files:"
echo "$coverage_files"

# Open each coverage file in the browser
for file in $coverage_files; do
    echo "Opening $file"
    open "$file"
done
