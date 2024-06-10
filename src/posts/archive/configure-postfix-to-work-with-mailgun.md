---
title: Configure Postfix to Work with MailGun
date: 2014-05-06
description: Using MailGun and a script to get there faster.
archived: 2018-01-13
---

![Mail Gun Logo](/posts/archive/content/images/2014/May/mailgun_logo.png)

MailGun is a relatively new online service that allows us to cheaply (and freely) send and receive emails through dozens of different ways. MailGun is incredibly flexible with an API for developers crafted in programming heaven.

I sought MailGun after I learned of the pain of setting up and maintaining a mail servers. Hours waiting for MX, SPF, and PTR records to propagate; hours testing DKIM keys and routing; and hours still setting up a gateway for secure connections with the mail server. I was ecstatic when I found MailGun does all of this for us developers (not to forget that MailGun gives us 10,000 emails a month, too).

After I integrated MailGun into my programs and web apps I realised there were so many other uses. Why not use MailGun on all of my production servers (the ones that aren't mail servers)? So I quickly put together a script and deployed MailGun to my servers.

Below is the script:

```bash
#!/bin/bash
#########################################################

mgUSERNAME="MailGun Username"
mgPASSWORD="COMPLEX PASSWORD"
testEmail="user@example.com"

#########################################################

echo "Installing this agent may be dangerous, make sure this is the correct server!"
echo
epoch=`date +%s`
name=`hostname`
while true; do
    read -p "Enter the hostname of this server to confirm: '$name': " hn
    case $hn in
        $name* ) break;;
        * ) echo "Not correct, cancelled."; exit;;
    esac
done

apt-get update
apt-get upgrade
apt-get install postfix mailutils sasl2-bin libsasl2-2 ca-certificates libsasl2-modules
apt-get purge sendmail*

echo "`hostname`.local" > /etc/postfix/node-name

mv /etc/postfix/main.cf /etc/postfix/main.cf.$epoch.bak

cat > /etc/postfix/main.cf << EOL
smtpd_banner = Relay $name ESMTP Postfix (Ubuntu)
biff = no
myorigin = /etc/postfix/node-name
mydestination =
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
inet_interfaces = loopback-only
relayhost = [smtp.mailgun.org]:587
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = static:$mgUSERNAME:$mgPASSWORD
smtp_sasl_security_options = noanonymous
smtp_tls_security_level = may
smtpd_tls_security_level = may
smtp_tls_note_starttls_offer = yes
smtpd_tls_CApath = /etc/ssl/certs
EOL

service postfix reload

echo "Test mail from MailGun" | mail -s "Test Mail" $testEmail

echo "Install Completed."
```

## Configuration

You need to make sure to create some mail gun credentials and edit the `mgUSERNAME` and `mgPASSWORD` variables.

![Step 1](/posts/archive/content/images/2014/May/mailgun-1-1.png)

![Step 2](/posts/archive/content/images/2014/May/mailgun-2-1.png)

Also ensure that `testEmail` is correct. This email will be used to test the postfix configurations. The next step is to simply run the script: ```bash ./mg-postfix.sh``` and you're done!

