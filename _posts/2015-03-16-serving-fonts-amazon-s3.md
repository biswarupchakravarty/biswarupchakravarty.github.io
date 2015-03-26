---
title: Serving Fonts From Amazon S3
tags:
  - Fonts
  - Amazon S3
  - CloudFront
  - CORS
---

A couple of days back we ran into some issues with our externally hosted fonts. Firefox and Chrome both refused to load them in certain cases (I don't have IE). This post is going to detail how we got past them by serving fonts from Amazon S3 instead of using CouldFront. I'm going to assume the reader is familiar with CORS and how it applies to external files and the `@font-face` rule.

The font files were hosted on S3 and were being served via CloudFront. We have eot, woff, ttf and svg formats. Firefox was the first to stop serving them for people who did not have the font in their cache. Chrome consistently picked up the files from cache, even in incognito mode.

One thing became clear as soon as I started debugging is that CloudFront caches CORS headers. Some of the `OPTIONS` requests were working for some people and some were not. In my case, my FF couldn't fetch the font file but the same FF version was working just fine for the guy sitting right beside me &#8211; both of us had cleared the cache from the beginning of time and were using In Private Browsing.

Now the issue was that CloudFront was busting up the cross domain requests. I'd already refreshed the CORS config from the AWS Console but it wasn't really making any sort of difference, so I decided to serve them via S3 instead.

I set a far future `Expires` header on all the font files and changed the root font file url in the SCSS file to point to S3 instead of CloudFront and deployed it for some testing.

Boom!

All HTTPS pages were broken. I should have seen this coming as AWS's S3 SSL Certificate is issued for `*.s3.amazonaws.com` and our bucket was `assets.[snip].com.s3.amazonaws.com`. Damn!

So I created another bucket `[snip]-fonts`, placed all the fonts there, changed their `Expires` header and changed the root url for fonts to `[snip]-fonts.s3.amazonaws.com`. Deployed on staging again (hooray for one click deployments!).

It worked. Reliably. On HTTP and HTTPS. Thank God!

If you're using AWS, I'd suggest you use S3 to host and serve your font files and bypass CloudFront altogether &#8211; S3 is was more reliable.

To summarize:

*   Create a bucket `<name>` at the root of your S3 and move all your font files into it.
*   Set a future `Expires` header. If you need to burst the cache, just add a query string variable to it ex. `[font-url]?_v=1`.
*   In your `@font-face` rules, ensure that the protocol is relative ie. `//<font-url>`