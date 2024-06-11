---
title: Power Ghost with Upstart
date: 2014-03-27
description: Using Upstart to manage a Ghost instance.
aliases: /power-ghost-with-upstart/index.html
---

![Upstart Logo](/posts/archive/content/images/2014/Mar/upstart80.png)

### Introduction

I hate init scripts. I simply hate them. They are great, highly customisable scripts that are massively used and horrible to create. When I first set up my Ghost blog (migrating from the php Wordpress) I used the provided init scripts to start my Ghost installation.

This work well until I started using Node.js for my other projects. Whenever I would make changes to my Ghost installation I would have to restart to recompile those changes. When I used the Ghost init script to restart my blog I would kill every other Node.js process on my server. My API would break in appearingly random times. It took me a while to figure out the problem, but as soon as I did I had to make a solution.

Simply the init script was not designed for parallel Node.js use. I was going to rewrite the script, but then realized why should I subject myself to the torture of init scripts when Ubuntu has native support for [Upstart](https://en.wikipedia.org/wiki/Upstart)?

Below is the Ghost init script simplified as an Upstart script.

### My Solution

```conf
start on filesystem and started networking
stop on shutdown

author "Mark Lopez"
description "Ghost Upstart Job"
version "0.2"

respawn
respawn limit 5 30

env name=ghost
env uid=www-data
env gid=www-data
env daemon=/usr/bin/node
env path=/var/www/ghost/index.js

script
	export NODE_ENV=production
	exec start-stop-daemon --start --make-pidfile --pidfile /var/run/$name.pid --name $name -c $uid:$gid -x $daemon $path >> /var/log/upstart/$name.log 2>&1
end script
```

### Installation

Copy the script into the `/etc/init/` directory (where Upstart reads its configurations on startup). Make sure the file is called `ghost.conf`. The script is *not* executed so do not add the execution flag like in a normal init scripts.

Make sure to modify the path variable to point to your Ghost installation folder. Also ensure that `uid` and `gid` are changed to the correct users that your want Node.js to run under (the current are default for the Apache process in Ubuntu)

To start and stop is done with the following self explanatory commands.

```bash
service ghost stop
service ghost start
service ghost restart
```

### Explanation

The first 2 lines are directives of when should Upstart automatically start and stop the script.

Lines `8` and `9` tells upstart to restart Node.js if for some reason it crashes.

Line `18` puts Ghost into production mode.

And line `19` is where Ghost is started and then managed by Upstart. I have Upstart give the process a name and pid file to ensure that there are no conflicts with other Node.js installations.

#### Profit!

#### Update

> A reader brought to my attention that Node.js may not be installed in a predictable location.
If in doubt use `which node` and update the daemon value to that. Thanks Jon ([Link](http://jensencloud.com))!
> I recomend to install Node.js from the official'ish [repository](https://launchpad.net/~chris-lea/+archive/ubuntu/node.js) as Ubuntu's repos lag behind more often than not.
