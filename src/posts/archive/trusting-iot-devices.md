Title: Trusting IOT Devices?
Description: Should we really put our trust in all these IOT devices? (Part 1)
Published: 1/18/18
---

![Sad Cloud](/content/images/2018/sad-cloud.png)

I attended DEFCON a couple years ago ([DEFCON 24](https://www.defcon.org/html/links/dc-archives/dc-24-archive.html)) and I remember a talk by Fred Bret-Mounet about how insecure some of the devices are that we trust connecting to our home networks - in his case, his Tygo solar panels. He talked about finding a way to bypass the rudimentary security found on these devices and something a bit more concerning.

^^^
> So anyhow looking around the filesystem, something caught my attention. Actually not the filesystem,  the running processes. OpenVPN. You guys know what open VPN is for? A VPN tunnel. Guess what. That VPN tunnel was on at all times on the device. I didn't do it. And I swear this is not a joke. I did not scan that VPN subnet. The manufacturer confirmed that all of its little siblings are on that subnet. 
^^^ Fred Bret-Mounet - [All Your Solar Panels are belong to Me](https://media.defcon.org/DEF%20CON%2024/DEF%20CON%2024%20video%20and%20slides/) (00:11:45-00:12:12)

TL;DR - Fred found a huge security hole, that if used, would create a backdoor into likely thousands of home networks.

Just think of all the devices that we trust within our networks - just look at the numbers from last year!

^^^
> The current count [of IOT devices] is somewhere between Gartner’s estimate of 6.4 billion (which doesn’t include smartphones, tablets, and computers), International Data Corporation’s estimate of 9 billion (which also excludes those devices), and IHS’s estimate of 17.6 billion (with all such devices included).
^^^ Amy Nordrum - [IEEE Spectrum](https://spectrum.ieee.org/tech-talk/telecom/internet/popular-internet-of-things-forecast-of-50-billion-devices-by-2020-is-outdated)

And there's going to be even more devices in the future. With that said, be it rushed or badly designed, we will see more and more devices that aren't secured. The only solution that I see is to simply not trust most IOT devices, plain and simple.
