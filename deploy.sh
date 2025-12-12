#!/bin/bash
set -e

echo "🎭 Deploying Studio Lucho to GitHub Pages..."

# 1. Build the app
echo "📦 Building web app..."
cd expoFrontend
npm install
npx expo export -p web
cd ..

# 2. Copy build to app/
echo "📋 Copying build to app/..."
rm -rf app/*
cp -r expoFrontend/dist/* app/

# 3. Commit on main (app is gitignored, so this just updates expoFrontend)
echo "💾 Committing changes on main..."
git add expoFrontend/
# Restore gitignored app/ to avoid modification warnings
git restore app/ 2>/dev/null || true
git diff --quiet && git diff --staged --quiet || git commit -m "Build: Update expoFrontend $(date +'%Y-%m-%d %H:%M')"

# 4. Switch to gh-pages and merge main
echo "🔄 Merging main into gh-pages..."
git checkout gh-pages
git merge main -m "Deploy: Sync with main $(date +'%Y-%m-%d %H:%M')"

# 5. Force add the app/ directory (it's gitignored on main but needed on gh-pages)
echo "📁 Adding built app files..."
git add -f app/
git commit -m "Deploy: Update app build $(date +'%Y-%m-%d %H:%M')" || echo "No app changes to commit"

# 6. Push both branches
echo "🚀 Pushing to GitHub..."
git push origin gh-pages
git checkout main
git push origin main

echo "✅ Deployment complete!"
echo "🌐 Your site will be live at: https://jav.github.io/lucho-party-game/"
echo "⏱️  GitHub Pages usually takes 1-2 minutes to update"
