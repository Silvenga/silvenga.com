Title: Configure Postfix to Work with MailGun
Published: 06 May 14
Description: Using MailGun and a script to get there faster.
Archived: 01/13/2018
---

![Mail Gun Logo](/content/images/2014/May/mailgun_logo.png)

MailGun is a relatively new online service that allows us to cheaply (and freely) send and receive emails through dozens of different ways. MailGun is incredibly flexible with an API for developers crafted in programming heaven. 

I sought MailGun after I learned of the pain of setting up and maintaining a mail servers. Hours waiting for MX, SPF, and PTR records to propagate; hours testing DKIM keys and routing; and hours still setting up a gateway for secure connections with the mail server. I was ecstatic when I found MailGun does all of this for us developers (not to forget that MailGun gives us 10,000 emails a month, too). 

After I integrated MailGun into my programs and web apps I realised there were so many other uses. Why not use MailGun on all of my production servers (the ones that aren't mail servers)? So I quickly put together a script and deployed MailGun to my servers.

Below is the script:

<code data-gist-id="a8946bc00cd73c51d82c"></code>

## Configuration

You need to make sure to create some mail gun credentials and edit the `mgUSERNAME` and `mgPASSWORD` variables. 

![Step 1](/content/images/2014/May/mailgun-1-1.png)

![Step 2](/content/images/2014/May/mailgun-2-1.png)

Also ensure that `testEmail` is correct. This email will be used to test the postfix configurations. The next step is to simply run the script: ```bash ./mg-postfix.sh``` and you're done!

