---
title: Setup Apache to Serve Ghost Blogs
date: 2014-07-11
description: Using Apache as a reverse proxy to service a Ghost instance.
---

I recently got a request to write a tutorial on how to set up a pre-existing Ghost blog to be served by Apache (the master web server) under the root domain. To add a twist, I will also show how to use Apache as a caching server for the static content of Ghost.

For this tutorial I assume the use of Apache 2.2 running on Ubuntu 12.04 LTS. I also assume a basic knowledge of Ubuntu and Apache. Let's start!

Lets start of with a clean slate. I personally make sure all my packages are updated and current. Good practice and can prevent issues in the future.

```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get autoremove
```

Now we are going to need to activate some Apache modules. These should be install (not enabled) by default.

```bash
# Enable to mods if not already enabled
# We use a2enmod as the modern way to enable mods (as opposed to creating symlinks)
sudo a2enmod cache disk_cache rewrite proxy proxy_balancer proxy_http

# Restart apache after any mod changes
sudo service apache2 restart
```

The mod `cache` provides the basic framework for any type of caching and does very little on its own. I enabled `disk_cache` to provide local caching on the disk (we could instead use `mem_cache` for RAM caching, although I do not recommend this). The mods `proxy` and `proxy_balancer` provide the ability to route or proxy requests from Apache to Ghost (Node.js). The mod `rewrite` will help us streamline the use of `proxy` and `proxy_balancer`.

Now lets find what ports Ghost is using. I would use this command if I wasn't sure what port to check.

```bash
sudo netstat -tlpn | grep node
```
For me this returns two programs that use Node.js:
```bash
# netstat -tlpn | grep node
tcp  0  0  127.0.0.1:2368  0.0.0.0:*  LISTEN  1275/node
tcp  0  0  127.0.0.1:6633  0.0.0.0:*  LISTEN  1252/node
```

The default port for production Ghost is `2368` so the first one looks correct. I personally know that port `6633` is from my Simple::Whois server. When we proxy request in apache we will direct the requests to port `2368` on the interface `127.0.0.1` (or localhost).

Lets get configuring Apache. Now there are many ways to do this. I personally like to keep a list of virtual hosts in one file. Although this is against industry standards, I find this approach prevents my renoun forgetfulness.

If this file does not already exist, lets create a `vhost.conf` file.

```bash
cd /etc/apache2
sudo touch vhosts.conf # We like touching files
nano vhosts.conf # or your favorite text editor (you vi guys...)
```
Copy and paste the following, I'll explain it next.

```file-/etc/apache2/vhosts.conf
<VirtualHost *:80>

	ServerName			silvenga.com
	ServerAlias 		www.silvenga.com
	DocumentRoot 		/var/www/ghost/public

	RewriteEngine 		on
	RewriteCond 		%{DOCUMENT_ROOT}/%{REQUEST_FILENAME} !-f
	RewriteRule 		^/(.*)$ balancer://upstream%{REQUEST_URI} [P,QSA,L]

	<Proxy balancer://upstream>
		BalancerMember 	http://127.0.0.1:2368
	</Proxy>

</VirtualHost>

CacheRoot				/var/www/cache
CacheEnable			  disk	 /
```
In Apache we use `VirtualHost` for each "virtual server". This allows one Apache server to serve multiple domains at the same time. For simplicity we will create a virtual server for our Ghost blog.

The `ServerName` directive should be set to your domain. In my case my domain is `silvenga.com`. I provide aliasing of the common `www` subdomain with `ServerAlias`. *These should be changed.*

`DocumentRoot` should be set to some public directly. In my Ghost installation folder (`/var/www/ghost`) I have a folder called public - containing non-ghost files (e.g. `robots.txt`, `sitemap.xml`, etc.). Set this to a good location. Wherever Ghost is install is recommended.

`RewriteEngine` enables direct rewriting of the request URL. This allows us to use `RewriteCond` and `RewriteRule`. This is where Apache gets tricky and these lines are commonly "copy and pasted". These two lines basically redirect (or rewrite) requests that do not exist in the `/ghost/public` to our proxy server. You should not need to change this. I would take a look at the [official documentation](https://httpd.apache.org/docs/2.2/mod/mod_rewrite.html) for more info.

The `Proxy` directive specifies a list of services to proxy too. We only have one server (ghost). We add that here. If Ghost's port is different, this is the place to assert that. More info can be found [here](https://httpd.apache.org/docs/2.2/mod/mod_proxy_balancer.html).

For disk caching we need to specify a local location for the cache (`CacheRoot `). I personally use `/var/www/cache`. `CacheEnable` enables disk caching for any address that starts with `/` - basically any and all requests. I will use `/var/www/cache` for this tutorial.

After we have this we need to tell Apache there is a unorthodox configuration file.

```bash
cd /etc/apache2
# Open Apache's main config.
nano apache2.conf
```
And add the following lines:
```/etc/apache2/apache2.conf
# Virtual hosts
Include /etc/apache2/vhosts.conf
```

To make sure that Apache can cache to the folder we gave, we should create it and set the correct permissions.

```bash
sudo mkdir /var/www/cache

# I assume the Apache is using the default user "www-data"
sudo chown www-data:www-data /var/www/cache
```
We should be all good. Let's restart and test out configuration.

```bash
sudo service apache2 restart
```
Done! Lets take a look and see if Apache is working correctly. Goto your domain listed in the `vhost.conf` file on the default port 80.

> Update: Forgot the `mod_proxy_http` to provide `mod_proxy_balancer` support for HTTP. Thanks [Jon](http://jensencloud.com)!
