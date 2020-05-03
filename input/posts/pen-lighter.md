Title: Silvenga's Penlighter
Published: 14 Mar 14
Description: I present a solution to disappearing mice, a PenLighter!
---

![A standard drawing tablet.](/content/images/2014/Mar/tablet_use_bamboo.jpg)

Tablets PC's have been out for years. And now with the release of Windows 8 (now 8.1) laptops with touch screens are on the rise; and for good reason - functionality can be added without reducing usability. My Thinkpad W520 (a very nice laptop) unfortunately does not have a touch screen. So a couple of months ago I purchased my first graphic tablet like this one:

I was amazed at my new found abilities, and to my advantage I now take all my notes paperless. Although the transition was practically painless, there were several issues using a touch screen that's not actually connected to the screen. My largest issue being that the mouse disappears on depending on the program. Right is an example of Microsoft OneNote, my note taking program:

![Cursor without PenLighter.](/content/images/2014/Jun/2014-06-21_21-27-47.png)

In case you can't see, my mouse is in the middle of the circle. My issue was losing the mouse whenever I looked away from the screen.

I started off using [Pen Attention](http://www.math.uaa.alaska.edu/~afkjm/PenAttention/). This was the only program that I could find for my uses. Pen Attention basically created a small colored circle around my mouse so I could easily find my pen. A great program, unfortunately I had some issues with lag. When I wrote too fast Pen Attention caused my pen to run roge for a couple of seconds. And when writing notes, this could get quite annoying. The reason I assumed was due to the slightly outdated code (or being written in C++). So no easy solution.

So one night I sat down and re-wrote my own version from scratch with speed and usability in mind. My project worked so well I've decided to release the program under the MIT licence ([link](/mit)). Here is a shot of the mouse running my version:

![Cursor with PenLighter.](/content/images/2014/Jun/2014-06-21_21-29-09.png)

The program runs in the tray. Just right click to access the settings. It is completely portable (stick it on a thumb drive), saves settings to a file in the root of the program, fast, and efficient. I behold Silvenga's Pen Lighter. 

Just download and run in Windows 8 (< 8 requires .Net Framework 4.5 to be installed, [link](http://www.microsoft.com/en-us/download/details.aspx?id=30653)).

[Download Silvenga's Penlighter (v1.0.0)](https://github.com/Silvenga/Slight.PenLighter/releases/tag/v1.0.0)

[Download Silvenga's Penlighter (v1.1.0-beta1)](https://github.com/Silvenga/Slight.PenLighter/releases/tag/v1.1.0-beta1) (Fixes offset bug on some computers)

[Download Silvenga's Penlighter (v1.1.0-beta2)](https://github.com/Silvenga/Slight.PenLighter/releases/tag/v1.1.0-beta2) (Fixes offset bug with multiple monitors using different DPI settings on Windows 8.1)

#### [Fork Penlighter on Github](https://github.com/Silvenga/Slight.PenLighter).
