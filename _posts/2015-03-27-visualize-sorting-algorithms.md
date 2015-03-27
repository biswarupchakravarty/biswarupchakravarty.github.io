---
layout: post
title: "A Visualization of Sorting Algorithms"
excerpt: "A real time visualization of how different sorting algorithms work &mdash; no GIFs/videos/java applets/flash, it's all done is javascript. Created using the HTML5 Canvas, CustomEvents and by messing with the Array's prototype. There's also a bit of AudioContext thrown in for some extra jazz."
tags:
  - Sorting Algorithms
  - Canvas
  - JavaScript
  - HTML5 Audio
stylesheet: "sorting"
javascript: "sorting"
---

<div class="curtain">
  <div class="curtain-container">
    <h3 class="curtain-caption">Sorting...</h3>
  </div>
</div>

<div class="jumbotron pure-form" id="divJumbotron2">
  <div class="pure-g">
    <div class="pure-u-1-1">
      <div class="pull-left">
        <select id="slctAlgorithms">
          <optgroup>Sort Algorithms</optgroup>
        </select>
        <button type="button" id="btnRestart" class="pure-button hidden">Repeat</button>
        <button type="button" id="btnStop" class="pure-button">Stop</button>
        <button type="button" id="btnPause" class="pure-button">Pause</button>
        <button type="button" id="btnPlay" class="pure-button">Play</button>
      </div>
      <div class="pull-right counters">
        <div class="access-counter"><span id="lblAccesses">0</span> Accesses</div>
        <div class="writes-counter"><span id="lblWrites">0</span> Writes</div>
        <div class="completion-counter"><span id="lblPercentage">0</span>% Complete</div>
      </div>
    </div>
  </div>
  &nbsp;
  <div class="pure-g">
    <div class="pure-u-1-1 canvas-container">
      <canvas class="canvas"></canvas>
      <button type="button" id="btnFullscreen" class="pure-button" disabled="disabled">
      Fullscreen
      </button>
    </div>
  </div>
</div>



  
<form class="" id="frmSort" action="javascript:void(0)">
  
  <!-- Pseudo Submit Button -->
  <input type="submit" class="hidden" style="display:none" data-aria-hidden="true">

  <!-- Playback Settings -->
  <div class="pure-u-1-2">
    <fieldset>
      <legend>Playback Speed</legend>
      <div class="pure-u-1-1">
        <button type="button" class="btn-speed pure-button active">1x</button>
        <button type="button" class="btn-speed pure-button">5x</button>
        <button type="button" class="btn-speed pure-button">10x</button>
        <button type="button" class="btn-speed pure-button">20x</button>
        <div class="checkbox hidden">
          <label>
            <input type="checkbox" value="sound" id="chkSound">
            Sound?
          </label>
        </div>
      </div>
    </fieldset>
  </div>

  <!-- Input Size and Specs -->
  <div class="pure-u-1-2">
    <fieldset disabled class="fldElements">
      <legend>Input Specs</legend>
      <div class="pure-u-1-1">
        <button type="button" class="btn-elements pure-button">Tiny</button>
        <button type="button" class="btn-elements pure-button active">Small</button>
        <button type="button" class="btn-elements pure-button">Med</button>
        <button type="button" class="btn-elements pure-button">Large</button>
        <button type="button" class="btn-elements pure-button">Very Large</button>
      </div>
      <div class="pure-u-1-1">
        <div class="checkbox">
          <label>
            <input type="checkbox" value="presorted" id="chkPresorted">
            Presorted Input?
          </label>
        </div>
        <div class="checkbox">
          <label>
            <input type="checkbox" value="equal" id="chkEqual">
            Equal Input?
          </label>
        </div>
      </div>
    </fieldset>
  </div>
</form>

<dl>
  <dt>Instructions</dt>
  <dd>Select your algorithm from the dropdown and hit play!</dd>
  <dt>Visualization</dt>
  <dd>The visualization represents an array with the white vertical bars representing integer elements of the array. The height of the bars are indicative of their value. During then visualization, the green flashes indicate an access (a value was read) and a red flash indicates an array write.</dd>
  <dt>Playback Speed</dt>
  <dd>At 1x playback speed, you'll see all the operations in real time. At 2x the speed, 2 operations will be bunched up and rendered together. At Nx, the visualization will update for every N operations.</dd>
  <dt>Additional Options</dt>
  <dd>
    <em>Presorted Input</em> ensures that all the elements in the array will be sorted in ascending order before the sort commences. <br> <em>Equal Input</em> ensures that all the elements in the array have the same value.
  </dd>
</dl>

---

# What's happening under the hood

What follows is a quick explanation of how the above visualization is created. There are basically three steps:

1. Modify the `Array` class - this will let us record any reads and writes that happen.
2. Prepare and then apply a sort algorithm on an array and record the operations (read/write) that took place.
3. Replay those operations on to a canvas.


## Modifying the `Array` class

Since JS doesn't allow overriding of the indexer ( à la [C#](https://msdn.microsoft.com/en-us/library/6x16t2tx.aspx) ), I thought it best to tack on additional methods to the array prototype. This is what the `Array#get` looks like

{% highlight js %}
Array.prototype.get = function (index) {
  var event = new CustomEvent('array.read', { detail: { index: indexOffset + index, value: this[index] } });
  document.dispatchEvent(event);
  return this[index];
};
{% endhighlight %}

Externally it'll work like a simple getter method, but every time it is called, it'll raise a [`CustomEvent`](https://developer.mozilla.org/en/docs/Web/API/CustomEvent) with details about which value was accessed and at what index. An `Array#set` was created along the same lines. And since most algorithms swap elements around, I created an `Array#swap` as well.

{% highlight js %}
Array.prototype.set = function (index, value) {
  var event = new CustomEvent('array.write', { detail: { index: indexOffset + index, value: value } });
  document.dispatchEvent(event);
  this[index] = value;
  return value;
};

Array.prototype.swap = function (index1, index2) {
  var temp = this.get(index2);
  this.set(index2, this.get(index1));
  this.set(index1, temp);
}
{% endhighlight %}


## Preparing and Sorting the Array

Preparing the array is easy: just fill it up with values ranging from `0` to `Array#length` and then shuffle them around. This is the snippet is use to shuffle the array:

{% highlight js %}
Array.prototype.shuffle = function () {
  var array = this, currentIndex = array.length,
    temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
};
{% endhighlight %}

Pick any sorting algorithm you like and then modify it to use `Array#get` and `Array#set` to read and write values respectively. This is what Insertion Sort looks like

{% highlight js %}
(function(lib){
  "use strict";
  var sort = function (arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
      var j = i, item = arr.get(j);
      for(; j > 0 && arr.get(j - 1) > item; j--) {
        arr.set(j, arr.get(j - 1));
      }
      arr.set(j, item);
    }
    return arr;
  };
  lib.insertionSort = sort;
})(algorithms);
{% endhighlight %}

Now while the array is getting sorted, we will be building up a list of operations by listening to the `array.read` and the `array.write` operations. ex.

{% highlight js %}
document.addEventListener('array.write', function (event) {
  var detail = event.detail,
    operation = new Operation(Operation.Types.WRITE, detail.value, detail.index);

  return this.playbackController.recordOperation(operation);
});
{% endhighlight %}


## Playing Operations on a Canvas

The basic render loop is simple. By now we have an array which contains all the operations that have taken place on the array. Start `Array#shift`ing the operations. For each operation, render an array read or an array write based on its type. The core function that renders the frames is

{% highlight js %}
klass4.prototype.renderNextFrames = function () {
  var operation, type,
    delegate, framesPlayed = [],
    sound = this.options.sound,
    numAccess = 0, numWrites = 0,
    operations = this.operations,
    setPercentage = this.options.setPercentage,
    incrementWrites = this.options.incrementWrites,
    incrementAccesses = this.options.incrementAccesses,
    OPS_PER_SECOND = i = this.options.OPS_PER_SECOND;

  while (i--) {
    operation = operations.shift();
    if (!operation) return;
    type = operation.type;
    switch (type) {
      case Operation.Types.READ:
        this.graphicsController.plotValueBeingAccessed(operation.value, operation.index);
        numAccess += 1;
        break;
      case Operation.Types.WRITE:
        this.graphicsController.plotValueBeingWritten(operation.value, operation.index);
        numWrites += 1;
        break;
      break;
    }
    framesPlayed.push(operation);
  }

  setPercentage(Number((this.totalOperations - this.operations.length) * 100 / this.totalOperations).toFixed(3));
  incrementWrites(numWrites);
  incrementAccesses(numAccess);
  sound ? beep(300 * operation.value/this.options.canvasHeight) : undefined;

  return framesPlayed;
};
{% endhighlight %}

And the render loop is simply: 

{% highlight js %}
klass4.prototype.playNextFrame = function (callback) {
  var operations = this.operations;
  if (this.paused) return;
  if (operations.length > 0) {
    this.resetFrames(this.framesDrawn);
    this.framesDrawn = this.renderNextFrames();
    requestAnimationFrame(function () {
      this.playNextFrame(callback);
    }.bind(this));
  } else callback();
};
{% endhighlight %}


## Contributions

Feel free to send in suggestions/improvements/bug reports. Sorting algorithms will also be appreciated. :)


*Inspired by [15 Sorting Algorithms in 6 Minutes](http://www.youtube.com/watch?v=kPRA0W1kECg).*