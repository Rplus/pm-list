#!/usr/bin/env sh

# abort on errors
set -e

# build

# move assets
cp ./pm-name.json ./pm-list/
cp ./img/808.png ./pm-list/
cp ./img/809.png ./pm-list/
cp ./img/sprite1-5.png ./pm-list/

# navigate into the build output directory
cd 'pm-list'

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:Rplus/pm-list.git master:gh-pages

cd -
