---
title: Ghost Scaffolding
date: 2014-12-16
description: A different take on how to host a Ghost instance, while using NPM as an upgrade manager.
archived: 2018-01-13
---

![The Ghost Blog logo.](/posts/archive/content/images/2014/12/ghost_logo-2.jpg)

## Introduction

I believe that upgrades should be simple, as such, I really hate dealing with zips and messing around in Ghost's core directory just to get the thing updated. Being the lazy developer that I am, I created this mini-project called Slight Ghost - a simple scaffolding for a Ghost blog, optimised for streamlined updates.

## Install

Make sure `git` and `node` is installed before attempting to install `slight-ghost`
```bash
# Ubuntu
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install git node
```

Installing is as simple as a `git clone`. First clone the scaffolding.
```bash
cd /var/www/
git clone https://github.com/Silvenga/Slight-Ghost.git ghost
cd ghost
```

Clone the default theme.
```bash
git submodule update --init --recursive
```

Install Ghost and its dependencies.
```bash
npm install
```

Copy the sample configuration file.
```bash
cp config.sample.js config.js
```

And edit config.js for your own needs.
```bash
nano config.js
```

**Note**: Make sure to include the `paths.contentPath` directive.

Done! Checkout the Upgrade section for information on how to upgrade.

## Run

Run `slight-ghost` just like the normal installation of Ghost. I recommend using Upstart to keep Ghost running (https://silvenga.com/power-ghost-with-upstart/).
```bash
node index.js
```

>**Notes**:
> `index.js` will automatically set Ghost into `production` mode. An `export NODE_ENV=production` is not needed.
> Make sure to change the permissions of the content directory!

## Upgrade

Update the base scaffolding and the default theme using `git`.
```bash
git pull --recurse-submodules
```

Updated and install any new dependencies using `npm`.
```bash
npm install
```
Done! Ghost has been updated to the latest stable revision - no need to deal with those pesky zips.

## Advance

Update the `content` directory.  *This is normally not required.*

Switch the repository to a scratch branch.
```bash
git checkout ghost
```

Get the latest stable version of Ghost to base the scaffolding off of.
```bash
git pull https://github.com/TryGhost/Ghost.git stable
```

Switch back to our original branch.
```bash
git checkout master
```

Merge the `content` directory to the scaffolding.
```bash
git checkout ghost -- content
```
Done! The `content` directory should now be updated to the latest version of Ghost.

## License

This project is under the MIT license, fork away!
