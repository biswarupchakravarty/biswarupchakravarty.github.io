---
layout: post
title: A Square Loader in Javascript
excerpt: "What do we want? &#8211; A square loader which isn't a gif! A square loader in javascript! When do we want it? &#8211; NOW! ( No jQuery or extra CSS required )"
tags:
  - Javascript
  - Canvas
  - Animation
---

# A Square Loader in Javascript

## Introducing `boxy.js`!

* * *

What do we want? &#8211; A square loader which isn't a gif! A square loader in javascript!

When do we want it? &#8211; NOW!

Alright then, lets begin.

<small>_**tl;dr** If you just want the code so that you can finally make your commit and go home, jump to [the end](#the-source)._</small>

### Step 1

Lets take a canvas and draw two lines on it, both fading from 100% opacity to 0% opacity and laid end-to-end. Make sure that the 0% opacity end of one touches the 100% opacity end of the other (head-to-toe, so to speak). Lets not attach this canvas to the DOM, this is going to remain in-memory. Lets call this line `L1`.

Each of these lines is of length `4a`, where `a` is the length of the side of the square that you want your loader to measure.

### Step 2

To begin with, assume an offset `offset` which is set to 0. Imagine cutting off a section of `L1`, of length `4a` units. When you're cutting off a section, don't cut it from the extreme left end; make sure to leave out the `offset`. i.e. if `offset` is 5px, you ignore the first 5px of `L1`.

In the first run, you should have a line of length `4a`. Let's call this one `L2`. Now, bend it at right angles along each quarter to form a square.

### Step 3

Wait for a small amount of time (and assume that the line `L1` regenerated) and increment the `offset` by a small amount. Repeat Step #2 above. You'll notice that this time the line that has been drawn is slightly different. It does not start at 100% opacity and it ends right after it hits 0% opacity.

Once you've created a square out of this one, you'll see what I'm talking about.

### Step 4

Repeat this until `L2`&#8216;s right edge touches the right edge of `L1`. At this point, restart by resetting your `offset` to 0.

### Step 5

Here it is!

<div id="boxyContainer"></div>

<script>// <![CDATA[
(function(){"use strict";var e={height:32,width:32,strokeWidth:5,strokeStartColor:"#fff",strokeEndColor:"#000",animationDuration:"50"},t=function(e){return Math.PI/180*e},n=function(e){var t,n;e=e||{};for(t=1;t<arguments.length;t+=1){if(!!arguments[t]){for(n in arguments[t]){if(arguments[t].hasOwnProperty(n)){e[n]=arguments[t][n]}}}}return e},r=function(e,t){return function(){return e.apply(t,arguments)}},i=function(e){var t,n,r=2*(e.height+e.width),i,s;t=document.createElement("canvas");n=t.getContext("2d");t.height=parseInt(e.strokeWidth,10);t.width=2*r;i=n.createLinearGradient(0,0,r,0);i.addColorStop(1,e.strokeStartColor);i.addColorStop(0,e.strokeEndColor);s=n.createLinearGradient(r,0,2*r,0);s.addColorStop(1,e.strokeStartColor);s.addColorStop(0,e.strokeEndColor);n.beginPath();n.lineWidth=e.strokeWidth;n.moveTo(0,0);n.lineTo(r,0);n.strokeStyle=i;n.stroke();n.beginPath();n.moveTo(r,0);n.lineTo(2*r,0);n.strokeStyle=s;n.stroke();return t},s=function(e,n,r,i){var s=n.getContext("2d"),o=2*(i.height+i.width),u=parseInt(o*e,10);s.clearRect(0,0,n.width,n.height);s.save();s.translate(i.width,0);s.rotate(t(180));s.drawImage(r,u,0,o/4,i.strokeWidth,0,-i.strokeWidth/2,i.width,i.strokeWidth);s.restore();s.save();s.rotate(t(90));s.translate(-i.width,0);s.drawImage(r,u+o/4,0,o/4,i.strokeWidth,i.width,-i.strokeWidth/2,i.width,i.strokeWidth);s.restore();s.save();s.translate(-i.width,i.height);s.drawImage(r,u+o/2,0,o/4,i.strokeWidth,i.width,-i.strokeWidth/2,i.width,i.strokeWidth);s.restore();s.save();s.translate(i.width,0);s.rotate(t(270));s.drawImage(r,u+o*.75,0,o/4,i.strokeWidth,-i.width,0,i.width,i.strokeWidth);s.restore()},o=function(t){this.options=n({},e,t);this.canvas=document.createElement("canvas");this.context=this.canvas.getContext("2d");this.canvas.height=this.options.height;this.canvas.width=this.options.width+this.options.strokeWidth;this._canvas=i(this.options);this._context=this._canvas.getContext("2d");this.progress=0};o.enqueueFrame=function(e){(window.requestAnimationFrame||function(e){setTimeout(e,0)})(e)};o.prototype.animateFrame=function(){s(this.progress/this.options.animationDuration,this.canvas,this._canvas,this.options);if(this.isActive===true){o.enqueueFrame(r(this.animateFrame,this))}this.progress=(this.progress+1)%this.options.animationDuration};o.prototype.start=function(){this.isActive=true;this.animateFrame();return this};o.prototype.stop=function(){this.isActive=false;return this};o.prototype.restart=function(){this.stop();this.start();return this};o.prototype.isActive=false;window.Boxy=o})();var boxy=new Boxy({strokeStartColor:"#dd0017",strokeEndColor:"#ddd",animationDuration:75});document.getElementById("boxyContainer").appendChild(boxy.canvas);boxy.start()
// ]]&gt;</script>

## The Source

* * *

Here's boxy's javascript source-code:

{% highlight js %}
/**
The MIT License (MIT)

Copyright (c) 2014 Biswarup Chakravarty

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
**/

(function () {
    "use strict";
    /*jslint browser: true, devel: true, nomen: true, white: true */

  var defaults = {

    // height in pixels of the loader
    height: 32,

    // height in pixels of the loader
    width: 32,

    // width in pixels of the loader
    strokeWidth: 5,

    // Color 1. This fades to Color 2
    strokeStartColor: '#fff',

    // Color 2
    strokeEndColor: '#000',

    // mystery argument!
    animationDuration: '50'

  }, degrees = function (degree) {
    return (Math.PI / 180) * degree;
  }, extend = function(out) {
    var i, key;
    out = out || {};
    for (i = 1; i &amp;lt; arguments.length; i += 1) {
      if (!(!arguments[i])) { 
        for (key in arguments[i]) {
          if (arguments[i].hasOwnProperty(key)) {
            out[key] = arguments[i][key];
          }
        }
      }
    }
    return out;
  }, bind = function (func, context) {
    return function boundFunction () {
      return func.apply(context, arguments);
    };
  }, createInMemoryCanvas = function (options) {
    var _canvas, _context,
      lineLength = 2 * (options.height + options.width),
      gradient1, gradient2;

    _canvas = document.createElement('canvas');
    _context = _canvas.getContext('2d');
    _canvas.height = parseInt(options.strokeWidth, 10);
    _canvas.width = 2 * lineLength;

    gradient1 = _context.createLinearGradient(0, 0, lineLength, 0);
    gradient1.addColorStop(1, options.strokeStartColor);
    gradient1.addColorStop(0, options.strokeEndColor);
    gradient2 = _context.createLinearGradient(lineLength, 0, 2 * lineLength, 0);
    gradient2.addColorStop(1, options.strokeStartColor);
    gradient2.addColorStop(0, options.strokeEndColor);

    _context.beginPath();
    _context.lineWidth = options.strokeWidth;
    _context.moveTo(0, 0);
    _context.lineTo(lineLength, 0);
    _context.strokeStyle = gradient1;
    _context.stroke();

    _context.beginPath();
    _context.moveTo(lineLength, 0);
    _context.lineTo(2 * lineLength, 0);
    _context.strokeStyle = gradient2;
    _context.stroke();

    return _canvas;
  }, drawBox = function (progress, canvas, buffer, options) {
    var context = canvas.getContext('2d'),
      lineLength = 2 * (options.height + options.width),
      lineProgress = parseInt(lineLength * progress, 10);

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(options.width, 0);
    context.rotate(degrees(180));
    context.drawImage(buffer, lineProgress, 0, lineLength / 4, options.strokeWidth, 0, -options.strokeWidth / 2, options.width, options.strokeWidth);
    context.restore();

    context.save();
    context.rotate(degrees(90));
    context.translate(-options.width, 0);
    context.drawImage(buffer, lineProgress + (lineLength / 4), 0, lineLength / 4, options.strokeWidth, options.width, -options.strokeWidth / 2, options.width, options.strokeWidth);
    context.restore();

    context.save();
    context.translate(-options.width, options.height);
    context.drawImage(buffer, lineProgress + (lineLength / 2), 0, lineLength / 4, options.strokeWidth, options.width, -options.strokeWidth / 2, options.width, options.strokeWidth);
    context.restore();

    context.save();
    context.translate(options.width, 0);
    context.rotate(degrees(270));
    context.drawImage(buffer, lineProgress + (lineLength * 0.75), 0, lineLength / 4, options.strokeWidth, -options.width, 0, options.width, options.strokeWidth);
    context.restore();
  }, Boxy = function (options) {
    this.options = extend({}, defaults, options);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.height = this.options.height;
    this.canvas.width = this.options.width + this.options.strokeWidth;

    this._canvas = createInMemoryCanvas(this.options);
    this._context = this._canvas.getContext('2d');

    this.progress = 0;
  };

  Boxy.enqueueFrame = function (delegate) {
    (window.requestAnimationFrame || function (f) { setTimeout(f, 0); })(delegate);
  };

  Boxy.prototype.animateFrame = function () {
    drawBox(this.progress / this.options.animationDuration, this.canvas, this._canvas, this.options);

    if (this.isActive === true) {
      Boxy.enqueueFrame(bind(this.animateFrame, this));
    }

    this.progress = (this.progress + 1) % this.options.animationDuration;
  };

  Boxy.prototype.start = function () {
    this.isActive = true;
    this.animateFrame();
    return this;
  };

  Boxy.prototype.stop = function () {
    this.isActive = false;
    return this;
  };

  Boxy.prototype.restart = function () {
    this.stop();
    this.start();
    return this;
  };

  Boxy.prototype.isActive = false;

  window.Boxy = Boxy;

}());
{% endhighlight %}

And here's a small snippet showing you how to use it:

{% highlight js %}
var boxy = new Boxy({
    strokeStartColor: '#dd0017',
    strokeEndColor: '#ddd',
    animationDuration: 75
});
document
  .getElementById('boxyContainer')
  .appendChild(boxy.canvas);
boxy.start();
{% endhighlight %}

#### Why boxy?

*   No CSS dependencies.
*   Purely javascript based.
*   No JS dependencies (yup, jQuery isn't required either!)
*   Uses `window.requestAnimationFrame` where available, falls back to `setTimeout(func, 0)` otherwise.
*   Boxy won't hang the UI thread, but if you decide to hang it yourself for some reason, boxy will _not_ animate. In this case you're better off with a normal CSS3 transform based loader. (Why are you hanging the thread anyways?)
*   Yes, I much prefer this to gifs.

**That's all folks**