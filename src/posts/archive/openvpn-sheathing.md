---
title: OpenVPN Sheathing
date: 2014-04-18
description: Sheathing OpenVPN traffic through a SSL tunnel using STunnel.
---

![OpenVPN Logo](/posts/archive/content/images/2016/10/openvpntech_logo1.png)

[OpenVPN](http://openvpn.net/index.php/open-source/245-community-open-source-software-overview.html) is soon becoming the standard for bypassing Internet censorship - and for good reason. OpenVPN is secure, Open Source, and extremely easy to use. Unfortunately, many censoring ISP's are determined to prevent and block OpenVPN. Possibly the only sure way to block OpenVPN tunnels is a method called [DPI (Deep packet inspection)](https://en.wikipedia.org/wiki/Deep_packet_inspection). What is troubling for many individuals is the fact the DPI works and is now widely used. Although how DPI detects OpenVPN traffic is important I will not talk about it today.

## So what is OpenVPN Sheathing?

OpenVPN Sheathing is a method to hide OpenVPN tunnels from DPI. There are two major ways to accomplish sheathing:

[**sTunnel**](https://www.stunnel.org/index.html): A GPL Open Source SSL encryption wrapper created by Michal Trojnara. sTunnel creates a full-blown HTTPS tunnel to disguise traffic as what is normally seen on a network. If an ISP were to block HTTPS every user would be severely crippled, thusly not normally done. Unfortunately, there is a performance penalty due to the HTTPS tunnel.

**[Obfsproxy](https://www.torproject.org/projects/obfsproxy.html.en)**: A Tor subproject. This method will make any traffic unrecognisable. This is a lighter method then sTunnel, but may be more easily detected. Rather than blending into normal traffic, Obfsproxy will appear completely different - via plugins. If an ISP were to whitelist allowed protocols rather than blacklist - Obfsproxy may be blocked.

In this post I will talk about **sTunnel** due to higher reliability and more documentation.

## sTunnel

So sTunnel has two sides - the **Client** and the **Server**. My server will be running Ubuntu, and since the installation is so similar for the client and server, my client will be running Windows.

> *Disclaimer: I use Ubuntu as my main server OS so all my instructions use the Ubuntu repositories. The configuration files should be compatible with any OS, while the packages can be downloaded from the target's repository.*

### Server

Our server will act as a relay point (although you can relay to localhost if you need).

#### Install sTunnel on the Server

Let's first install sTunnel through `apt-get`.

```bash
sudo apt-get update            # always a good idea
sudo apt-get upgrade           # let's start fresh
sudo apt-get install stunnel4  # 4 is the newest version as of 4/2014
```

#### Configure sTunnel

We are using a HTTPS tunnel so let's generate some HTTPS certificates (self signed).

```bash
# let's work in our tmp directory
cd /tmp/

# Use OpenSSL to generate a key called stunnel.key with a bit strength of 2K
# Make sure that we use no password (convenience, OpenVPN is already secure)
openssl genrsa -out stunnel.key 2048

# Use OpenSSL to generate a new certificate signed by that key we just created
# 1826 days = 5 years, change if needed
openssl req -new -x509 -key stunnel.key -out stunnel.crt -days 1826
```

You should get something like this:

> *You can answer `.` (period) to all the questions except the `Common Name` which should be your hostname, public IP address, or DNS name of the server.*

```bash
# openssl req -new -x509 -key stunnel.key -out stunnel.crt -days 1826
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:.
State or Province Name (full name) [Some-State]:.
Locality Name (eg, city) []:.
Organization Name (eg, company) [Internet Widgits Pty Ltd]:.
Organizational Unit Name (eg, section) []:.
Common Name (e.g. server FQDN or YOUR name) []:HOSTNAME
Email Address []:.
```

We now have both the certificate and its key. For convenience let's combine the two files into one.

```bash
# Concatenate the key and the certificate into the file /etc/stunnel/stunnel.pem
cat stunnel.key stunnel.crt > /etc/stunnel/stunnel.pem
```

Cool, our certificate is ready. Clean up our current directory.

```bash
rm stunnel.crt stunnel.key
```

Move to our sTunnel configuration directory and create a configuration file.

```bash
cd /etc/stunnel/      # Default on Ubuntu
touch stunnel.conf    # We like touching files :P
nano stunnel.conf     # Or your favorite editor
```

Copy the following into the new file.

```
# Location of the certificate that we created
cert = /etc/stunnel/stunnel.pem

# Name of the connection
[openvpn-localhost]
# The port to listen on
accept = 8443
# Connect to the local OpenVPN server
connect = 127.0.0.1:1192

# Another alternative
# Forwarding connections to Private Internet Access
[openvpn-florida-usa]
accept = 1198
connect = us-florida.privateinternetaccess.com:443

```

> *HTTPS cannot use UDP, so make sure that any OpenVPN server you're connecting to must accept TCP connections!*

Enable and start sTunnel.

```bash
nano /etc/default/stunnel4
# Change ENABLED=0 to ENABLED=1

service stunnel4 start
```

And we're all set, done with the server side configuration.

### Client

![Windows sTunnel Options](/posts/archive/content/images/2014/Apr/2014-04-18_19-31-44.png)

Download the Windows sTunnel software.

[Stunnel Downloads](https://www.stunnel.org/downloads.html).

Install the software with default options.

Start the software (search for `stunnel gui`) and edit the configuration with  `Configuration > Edit Configuration`. Copy and paste the following to the end of the file. Make sure to edit `remote-server.example.com` to be your server address.

```
[openvpn-localhost]
# Set sTunnel to be in client mode (defaults to server)
client = yes
# Port to locally connect to
accept = 127.0.0.1:1194
# Remote server for sTunnel to connect to
connect = remote-server.example.com:8443

[openvpn-florida-usa]
client = yes
accept = 127.0.0.1:1198
connect =  remote-server.example.com:1198
```

Reload the configuration by `Configuration > Reload Configuration`.

Client side configuration is now complete. When connecting with OpenVPN make sure to connect to that local address, for example: `127.0.0.1:1194`. This will allow sTunnel to hide the OpenVPN traffic to your server. DPI has no chance to block you now!

> Updated: Grammer changes.


> Updated: `client` directives are for service configuation not global. Thanks to
Johnny.
