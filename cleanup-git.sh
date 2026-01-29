#!/bin/bash

echo "=== Git History Cleanup Script ==="
echo "This will remove large files from Git history"

# Backup current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo "Creating backup branch..."
git branch backup-before-cleanup-$CURRENT_BRANCH

# Download BFG if not exists
if [ ! -f "bfg.jar" ]; then
    echo "Downloading BFG Repo Cleaner..."
    wget -O bfg.jar https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
fi

# Run BFG to remove directories
echo "Removing .firebase directory from history..."
java -jar bfg.jar --delete-folders .firebase

echo "Removing node_modules directory from history..."
java -jar bfg.jar --delete-folders node_modules

echo "Removing .next directory from history..."
java -jar bfg.jar --delete-folders .next

echo "Removing files larger than 100MB..."
java -jar bfg.jar --strip-blobs-bigger-than 100M

# Cleanup and optimize repository
echo "Running git gc to optimize repository..."
git reflog expire --expire=now --all && git gc --prune=now --aggressive

echo "=== Cleanup Complete ==="
echo "Check the repository status and push when ready"