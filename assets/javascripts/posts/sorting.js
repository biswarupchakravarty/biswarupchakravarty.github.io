(function () {

  window.operations = [];
  window.indexOffset = 0;

  Array.prototype.get = function (index) {
    var event = new CustomEvent('array.read', { detail: { index: indexOffset + index, value: this[index] } });
    document.dispatchEvent(event);
    return this[index];
  };

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

}());


(function () {

  'use strict';

  window.algorithms = {};

  var $ = document.querySelector.bind(document);
  var $style = window.getComputedStyle;
  var $$ = document.querySelectorAll.bind(document);

  var jumbotron1 = $('#divJumbotron1');
  var jumbotron2 = $('#divJumbotron2');
  var canvas = $('canvas');
  var curtain = $('.curtain');
  var btnPlay = $('#btnPlay');
  var btnPlayText = $('#btnPlayText');
  var btnPause = $('#btnPause');
  var btnRestart = $('#btnRestart');
  var btnStop = $('#btnStop');
  var dropdown = $('#slctAlgorithms');
  var buttonDropdowns = $$('[data-toggle=dropdown]');
  var txtNumElements = $('#txtElements');
  var form = $('#frmSort');
  var submitButton = $('input[type=submit]');
  var btnSpeeds = $$('.btn-speed');
  var btnElements = $$('.btn-elements');
  var fldElements = $('.fldElements');
  var chkSound = $('#chkSound');
  var algoName = $('#lblAlgoName');
  var lblSelectedAlgorithm = $('#lblSelectedAlgorithm');
  var lblAccessCounter = $('#lblAccesses');
  var lblWriteCounter = $('#lblWrites');
  var lblPercentageCounter = $('#lblPercentage');

  var visualizer;

  var counterThrottleTime = ~~(1000/24), counterTimerHandle = null, accesses = 0, writes = 0, percentage = 0;
  var onIncrement = function (type) {
    return function (value) {
      switch (type) {
        case 'access': accesses += value; break;
        case 'writes': writes += value; break;
        case 'percentage': percentage = value; break;
      }
      if (counterTimerHandle) return;
      counterTimerHandle = setTimeout(function () {
        lblWriteCounter.innerText = ~~lblWriteCounter.innerText + writes;
        lblAccessCounter.innerText = ~~lblAccessCounter.innerText + accesses;
        lblPercentage.innerText = Math.round(value);
        writes = 0;
        accesses = 0;
        counterTimerHandle = null;
      }, counterThrottleTime);
    }
  };

  var _load = window.onload || function () {};
  window.onload = function () {
    computeNumberOfElements();
    loadAlgorithms();
    createVisualizer();
    computeNumberOfElements();
    createVisualizer();
    return _load();
  };

  var loadAlgorithms = function () {
    var name, value, child,
      names = Object.keys(algorithms),
      len = names.length, _buffer = [];

    while (len--) {
      name = value = names[len];
      name = name.replace('Sort', '');
      name = name[0].toUpperCase() + name.slice(1) + ' Sort';
      _buffer.push('<option value="' + value + '">' + name + '</option>');
    }
    dropdown.innerHTML = _buffer.join('');

    // lblSelectedAlgorithm.innerText = name;
    // lblSelectedAlgorithm.dataset.value = value;
    return algorithms;
  };

  var createVisualizer = function () {
    var selectedAlgorithm = getSelectedAlgorithm();
    visualizer = new Visualizer(canvas, selectedAlgorithm, {
      numElements: getNumberOfElements(),
      presorted: true
    });
    window.visualizer = visualizer;
    updateButtons('initialize');
  };

  var computeNumberOfElements = function () {
    var width = canvas.width,
      lineWidths = [], lineWidth = 2,
      numOptions = 5, completed = 0;

    while (completed < numOptions) {
      if (lineWidth > Math.sqrt(width)) break;
      lineWidth += 2;
      if (width % lineWidth === 0) {
        completed += 1;
        btnElements[numOptions - completed].dataset.value = lineWidth;
      }
    }
    return lineWidths;
  };

  var getNumberOfElements = function () {
    var result;
    btnElements.forEach(function (btnSpeed) {
      if (btnSpeed.classList.contains('active')) {
        result = canvas.width / ~~btnSpeed.dataset.value
      }
    });
    return result;
  };

  var getCheckboxValue = function (checkboxId) {
    return $('#chk' + checkboxId).checked;
  };

  var getOpsPerSecond = function () {
    var result;
    btnSpeeds.forEach(function (btnSpeed) {
      if (btnSpeed.classList.contains('active')) {
        result = ~~btnSpeed.innerHTML.replace('x', '')
      }
    });
    return result;
  };

  var getSelectedAlgorithm = window.a = function () {
    return Array.prototype.slice.call(dropdown.getElementsByTagName('option')).filter(function (option) {
      return option.selected;
    })[0].value;
  };

  var updateButtons = function (action) {
    switch (action) {
      case 'initialize':
        btnPlay.disabled = false;
        btnStop.disabled = true;
        btnPause.disabled = true;
        btnRestart.disabled = true;
        fldElements.disabled = false;
        break;
      case 'playback_started':
        lblAccesses.innerText = 0;
        lblWriteCounter.innerText = 0;
        lblPercentage.innerText = 0;
        // intentional fallthrough
      case 'playback_resumed':
        btnPlay.disabled = true;
        btnStop.disabled = false;
        // btnPlayText.innerText = ' Play';
        btnPause.disabled = false;
        btnRestart.disabled = false;
        fldElements.disabled = true;
        break;
      case 'playback_complete':
        btnPlay.disabled = false;
        btnStop.disabled = true;
        btnPause.disabled = true;
        btnRestart.disabled = true;
        fldElements.disabled = false;
        break;
      case 'playback_paused':
        btnPlay.disabled = false;
        btnStop.disabled = false;
        // btnPlayText.innerText = ' Resume';
        btnPause.disabled = true;
        btnRestart.disabled = false;
        fldElements.disabled = true;
        break;
      case 'playback_stopped':
        btnPlay.disabled = false;
        btnStop.disabled = true;
        btnPause.disabled = true;
        btnRestart.disabled = true;
        fldElements.disabled = false;
        break;
    }
  };

  var onPlayRestart = function (playOrRestart) {
    return function (e) {
      var selectedOption = dropdown.getElementsByTagName('option')[dropdown.selectedIndex],
        selectedAlgorithm = getSelectedAlgorithm();

      if (playOrRestart === 'play' && visualizer.isPaused()) {
        visualizer.resumeVisualization();
        updateButtons('playback_resumed');
        return;
      }

      visualizer.stopVisualization();
      visualizer = new Visualizer(canvas, selectedAlgorithm, {
        OPS_PER_SECOND: getOpsPerSecond(),
        numElements: getNumberOfElements(),
        setPercentage: onIncrement('percentage'),
        incrementAccesses: onIncrement('access'),
        incrementWrites: onIncrement('writes'),
        presorted: getCheckboxValue('Presorted'),
        allEqual: getCheckboxValue('Equal'),
        sound: getCheckboxValue('Sound')
      });
      visualizer.playVisualization().then(function () {
        updateButtons('playback_complete');
      });
      updateButtons('playback_started');
    };
  };

  document.addEventListener('sort.start', function () {
    curtain.classList.add('visible');
    curtain.classList.remove('hidden');
  });

  document.addEventListener('sort.end', function () {
    curtain.classList.remove('visible');
  });

  btnPlay.onclick = function () {
    if (!form.checkValidity()) {
      var e = new CustomEvent('click');
      submitButton.dispatchEvent(e);
      return false;
    }
    onPlayRestart('play')();
  };

  form.addEventListener('submit', btnPlay.onclick)

  btnPause.onclick = function () {
    visualizer.pauseVisualization();
    updateButtons('playback_paused');
  };

  btnStop.onclick = function () {
    visualizer.stopVisualization();
    createVisualizer();
    updateButtons('playback_stopped');
  };

  btnRestart.onclick = onPlayRestart('restart');

  chkSound.onchange = function () {
    visualizer.setSound(this.checked);
  };

  btnSpeeds = Array.prototype.slice.call(btnSpeeds);
  btnSpeeds.forEach(function (btnSpeed) {
    btnSpeed.onclick = function () {
      var speed = ~~btnSpeed.innerHTML.replace('x', '')
      visualizer.setSpeed(speed);
      btnSpeeds.forEach(function (btnSpeed) {
        btnSpeed.classList.remove('active');
      });
      btnSpeed.classList.add('active');
    };
  });

  btnElements = Array.prototype.slice.call(btnElements);
  btnElements.forEach(function (btnElement) {
    btnElement.onclick = function () {
      var numElements = ~~btnElement.innerHTML.replace('x', '');
      
      btnElements.forEach(function (btnElement) {
        btnElement.classList.remove('active');
      });
      btnElement.classList.add('active');
      createVisualizer();
    };
  });

  var onButtonDropdownMenuClick = function (event) {
    var button, target = event.target;

    if (target.nodeName !== 'A') return;
    button = target.parentNode.parentNode.previousElementSibling.querySelector('.btn-dropdown-value');
    button.innerText = target.innerText;
    button.dataset.value = target.dataset.value;
    this.removeEventListener('click', onButtonDropdownMenuClick);
  };

  buttonDropdowns = Array.prototype.slice.call(buttonDropdowns);
  buttonDropdowns.forEach(function (buttonDropdown) {
    var menu, hideMenu = function () { document.removeEventListener('click', hideMenu); menu.style.display = 'none'; };
    buttonDropdown.onclick = function (e) {
      menu = buttonDropdown.nextElementSibling
      menu.style.display = 'block';
      menu.addEventListener('click', onButtonDropdownMenuClick);
      e.stopPropagation();
      document.addEventListener('click', hideMenu);
    };
  });

}());



(function () {

  var noop = function NoOp() {};

  var klass1 = function Visualizer (canvas, algo, options) {
    options = options || {};

    this.options = this.prepareOptions(options);
    this.setAlgorithm(algo);
    this.prepareCanvas(canvas);
    this.prepareInputs();
    this.preparePlayback();
    this.bindEvents();
  };

  klass1.prototype.prepareOptions = function (options) {
    options = options || {};
    options.numElements = isNaN(~~options.numElements) ? 20 : ~~(options.numElements);
    options.allEqual = !!(options.allEqual);
    options.OPS_PER_SECOND = isNaN(~~options.OPS_PER_SECOND) || ~~(options.OPS_PER_SECOND) < 1 ? 10 : ~~(options.OPS_PER_SECOND);
    options.presorted = !!(options.presorted);
    options.setPercentage = typeof options.setPercentage === 'function' ? options.setPercentage : noop;
    options.incrementAccesses = typeof options.incrementAccesses === 'function' ? options.incrementAccesses : noop;
    options.incrementWrites = typeof options.incrementWrites === 'function' ? options.incrementWrites : noop;

    return options;
  };

  klass1.prototype.prepareCanvas = function (canvas) {
    this.options.canvasHeight = canvas.clientHeight;
    this.options.canvasWidth = canvas.clientWidth;
    canvas.height = this.options.canvasHeight;
    canvas.width = this.options.canvasWidth;
    canvas.style.height = this.options.canvasHeight + 'px';
    canvas.style.width = this.options.canvasWidth + 'px';
    this.context = canvas.getContext('2d');
    return this.canvas = canvas;
  };

  klass1.prototype.prepareInputs = function () {
    var i = 0, array = [],
      options = this.options,
      allEqual = !!(options.allEqual),
      numElements = options.numElements || 10,
      canvasWidth = options.canvasWidth,
      canvasHeight = options.canvasHeight,
      lineThickness = Math.round(canvasWidth / numElements);

    this.array = array;
    this.options.lineThickness = lineThickness;
    while (i < numElements) {
      array.push(allEqual ? canvasHeight / 2 : ~~(canvasHeight * i / numElements));
      i += 1;
    }
    return this.options.presorted ? this.array : this.array.shuffle();
  };

  klass1.prototype.preparePlayback = function () {
    var playbackController = new PlaybackController(this.canvas, this.array, this.options);

    playbackController.drawArray();
    this.playbackController = playbackController;
    return this.playbackController;
  };

  klass1.prototype.bindEvents = function () {
    var onWrite = this.onArrayWrite.bind(this),
      onRead = this.onArrayRead.bind(this);

    document.addEventListener('array.write', onWrite);
    document.addEventListener('array.read', onRead);
    this.listeners = { 'array.write': onWrite, 'array.read': onRead };
  };

  klass1.prototype.onArrayWrite = function (event) {
    var detail = event.detail,
      operation = new Operation(Operation.Types.WRITE, detail.value, detail.index);

    return this.playbackController.recordOperation(operation);
  };

  klass1.prototype.onArrayRead = function (event) {
    var detail = event.detail,
      operation = new Operation(Operation.Types.READ, detail.value, detail.index);

    return this.playbackController.recordOperation(operation);
  };

  klass1.prototype.setAlgorithm = function (algorithm) {
    this.algorithm = algorithms[algorithm];
  };

  klass1.prototype.setSound = function (value) {
    this.options.sound = value;
    this.playbackController.setSound(value);
  };

  klass1.prototype.setSpeed = function (speed) {
    speed = Number(speed);
    if (isNaN(speed) || speed < 1 || speed > 20) speed = 2;
    this.playbackController.options.OPS_PER_SECOND = speed;
  };

  klass1.prototype.setNumElements = function (numElements) {
    this.options.numElements = numElements;
  };

  klass1.prototype.applySort = function () {
    var promise = new Promise(),
      sortStartedEvent = new Event('sort.start'),
      sortFinishedEvent = new Event('sort.end');

    document.dispatchEvent(sortStartedEvent);
    setTimeout(function () {
      this.algorithm(this.array);
      document.dispatchEvent(sortFinishedEvent);
      promise.resolve();
    }.bind(this), 10);
    return promise;
  };

  klass1.prototype.startPlayback = function () {
    var playback = this.playbackController,
      promise = new Promise();

    playback.startPlayback().then(function () {
      this.onVisualizationEnd(this);
      promise.resolve();
    }.bind(this));
    return promise;
  };

  klass1.prototype.playVisualization = function () {
    var promise = new Promise();

    this.applySort().then(function () {
      this.startPlayback(this).then(function () {
        promise.resolve();
      });
    }.bind(this));
    return promise;
  };

  klass1.prototype.pauseVisualization = function () {
    if (this.isPaused()) return;
    this.playbackController.pause();
  };

  klass1.prototype.resumeVisualization = function () {
    if (!this.isPaused()) return;
    this.playbackController.unpause();
  };

  klass1.prototype.isPaused = function () {
    return this.playbackController.paused === true && !this.isCompleted();
  };

  klass1.prototype.isCompleted = function () {
    return this.playbackController.operations.length === 0;
  };

  klass1.prototype.stopVisualization = function () {
    var playbackController = this.playbackController,
      playbackPromise = playbackController.playbackPromise;

    if (!this.isCompleted()) {
      this.onVisualizationEnd();
    }
    if (!this.isCompleted() && playbackPromise) {
      playbackPromise.then(noop);
    }
  };

  klass1.prototype.onVisualizationEnd = function () {
    this.array.length = 0;
    this.playbackController.operations.length = 0;
    document.removeEventListener('array.write', this.listeners['array.write']);
    document.removeEventListener('array.read', this.listeners['array.read']);
    console.log('internal onVisualizationEnd');
  };

  window.Visualizer = klass1;

  var klass2 = function GraphicsController (canvas, options) {
    this.options = this.prepareOptions(options);
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    this.prepareBuffers();
  };

  klass2.prototype.prepareOptions = function (options) {
    return {
      height: options.canvasHeight,
      width: options.canvasWidth,
      lineThickness: options.lineThickness
    };
  };

  klass2.prototype.buffers = {
    backgroundValueCanvas: null,
    constantValueCanvas: null,
    accessedValueCanvas: null,
    writtenValueCanvas: null
  };

  klass2.prototype.prepareBuffers = function () {
    var canvasHeight = this.options.height,
      lineThickness = this.options.lineThickness;

    var backgroundValueCanvas = this.buffers.backgroundValueCanvas = document.createElement('canvas');
    backgroundValueCanvas.height = canvasHeight;
    backgroundValueCanvas.width = lineThickness;
    backgroundValueContext = backgroundValueCanvas.getContext('2d');
    backgroundValueContext.fillStyle = '#000000';
    backgroundValueContext.fillRect(0, 0, lineThickness, canvasHeight);

    var constantValueCanvas = this.buffers.constantValueCanvas = document.createElement('canvas');
    constantValueCanvas.height = canvasHeight;
    constantValueCanvas.width = lineThickness;
    constantValueContext = constantValueCanvas.getContext('2d');
    constantValueContext.fillStyle = '#ffffff';
    constantValueContext.fillRect(0, 0, lineThickness, canvasHeight);
    constantValueContext.strokeStyle = '#000000';
    (lineThickness > 2) && constantValueContext.strokeRect(0, 0, lineThickness, canvasHeight);

    var accessedValueCanvas = this.buffers.accessedValueCanvas = document.createElement('canvas');
    accessedValueCanvas.height = canvasHeight;
    accessedValueCanvas.width = lineThickness;
    accessedValueContext = accessedValueCanvas.getContext('2d');
    accessedValueContext.fillStyle = '#00ff00';
    accessedValueContext.fillRect(0, 0, lineThickness, canvasHeight);
    accessedValueContext.strokeStyle = '#000000';
    (lineThickness > 2) && accessedValueContext.strokeRect(0, 0, lineThickness, canvasHeight);

    var writtenValueCanvas = this.buffers.writtenValueCanvas = document.createElement('canvas');
    writtenValueCanvas.height = canvasHeight;
    writtenValueCanvas.width = lineThickness;
    writtenValueContext = writtenValueCanvas.getContext('2d');
    writtenValueContext.fillStyle = '#ff0000';
    writtenValueContext.fillRect(0, 0, lineThickness, canvasHeight);
    accessedValueContext.strokeStyle = '#000000';
    (lineThickness > 2) && writtenValueContext.strokeRect(0, 0, lineThickness, canvasHeight);

  };

  klass2.prototype.clear = function () {
    this.context.clearRect(0, 0, this.options.width, this.options.height);
  };

  klass2.prototype.plotConstantValue = function(value, index) {
    var context = this.context,
      buffers = this.buffers,
      lineThickness = this.options.lineThickness,
      height = this.options.height;

    context.drawImage(buffers.backgroundValueCanvas, lineThickness * index, 0);
    context.drawImage(buffers.constantValueCanvas, lineThickness * index, height - value);
  };

  klass2.prototype.plotValueBeingAccessed = function(value, index) {
    var context = this.context,
      buffers = this.buffers,
      lineThickness = this.options.lineThickness,
      height = this.options.height;

    context.drawImage(buffers.accessedValueCanvas, lineThickness * index, height - value);
  };

  klass2.prototype.plotValueBeingWritten = function(value, index) {
    var context = this.context,
      buffers = this.buffers,
      lineThickness = this.options.lineThickness,
      height = this.options.height;

    context.drawImage(buffers.backgroundValueCanvas, lineThickness * index, 0);
    context.drawImage(buffers.writtenValueCanvas, lineThickness * index, height - value);
  };

  klass2.prototype.resetColors = function (operations) {
    var length, operation, i = 0;
    if (!operations) return;

    length = operations.length;
    while (i < length) {
      operation = operations[i];
      plotConstantValue(operation.value, operation.index);
      i += 1;
    }
  };

  window.GraphicsController = klass2;

  var klass3 = function Operation (type, value, index) {
    this.type = type;
    this.value = value;
    this.index = index;
  };

  klass3.Types = {
    READ: 1,
    WRITE: 2
  };

  window.Operation = klass3;

  var klass4 = function PlaybackController (canvas, array, options) {
    this.operations = this.operations || [];
    this.options = options;
    this.array = array;
    this.operations.length = 0;
    this.prepareGraphics(canvas, options);
  };

  klass4.prototype.prepareGraphics = function (canvas, options) {
    var array = this.array;
    return this.graphicsController = new GraphicsController(canvas, options);
  };

  klass4.prototype.setSound = function (value) {
    if (value === false) {
      stopBeeping();
    }
  };

  klass4.prototype.recordOperation = function (operation) {
    this.operations.push(operation);
  };

  klass4.prototype.startPlayback = function () {
    var promise = this.playbackPromise = new Promise();

    this.totalOperations = this.operations.length;
    this.playNextFrame(function () {
      this.playbackPromise.resolve();
    }.bind(this));
    return promise;
  };

  klass4.prototype.onPlaybackEnd = function () {
    
  };

  klass4.prototype.unpause = function () {
    var promise = this.playbackPromise;

    this.paused = false;
    this.playNextFrame(function () {
      promise.resolve();
    });
    return promise;
  };

  klass4.prototype.pause = function () {
    this.paused = true;
    stopBeeping();
  };

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

  klass4.prototype.resetFrames = function (operations) {
    var length, operation, i = 0;
    if (!operations) return;

    length = operations.length;
    while (i < length) {
      operation = operations[i];
      this.graphicsController.plotConstantValue(operation.value, operation.index);
      i += 1;
    }
  };

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

  klass4.prototype.drawArray = function () {
    var element, array = this.array,
      len = array.length, context = this.context,
      canvasWidth = this.options.canvasWidth,
      canvasHeight = this.options.canvasHeight,
      plotConstantValue = this.graphicsController.plotConstantValue.bind(this.graphicsController);

    this.graphicsController.clear();

    while (len--) {
      element = array[len];
      plotConstantValue(element, len);
    }
  };

  window.PlaybackController = klass4;

  var klass5 = function Promise() {};

  klass5.prototype.callback = noop;

  klass5.prototype.then = function(callback) {
    this.callback = callback;
  };

  klass5.prototype.resolve = function () {
    return this.callback();
  };

  window.Promise = klass5;


}());



(function () {

  window.beep = function () {};
  window.stopBeeping = function () {};

  try {
    window.sound = true;
    var ctx = new(window.audioContext || window.webkitAudioContext);
    var oscillator, playing = false;
    var gainNode = ctx.createGain();
    var freq_lower_bound = 100;
    var freq_higher_bound = 300;
    gainNode.connect(ctx.destination);
    gainNode.gain.value = 0.3;

    beep = function(frequency) {
      if (!sound) return;
      var duration = 0;

      if (!(window.audioContext || window.webkitAudioContext)) {
        throw Error("Your browser does not support Audio Context.");
      }
      duration = +duration;
      frequency *= 1.2;

      if (playing) {
        playing = false;
        oscillator.noteOff(0);
      }

      oscillator = ctx.createOscillator();
      oscillator.type = 1;
      oscillator.frequency.value = freq_lower_bound + ((freq_higher_bound - freq_lower_bound) * frequency/100);
      oscillator.connect(gainNode);

      oscillator.noteOn(0);
      playing = true;
    };

    stopBeeping = function () {
      typeof oscillator != 'undefined' && oscillator.noteOff(0);
    };

  } catch (e) {
    
  }

}());



(function (lib) {

  var frames, _array, _slice = Array.prototype.slice;

  var sort = function (array) {
    frames = [];
    _array = _slice.call(array);

    array.sort(function (a, b) {
      frames.push(_slice.call(array));
      return a - b;
    });

    var length = frames.length, i = 0, j = 0, frame;
    while (i < length) {
      frame = frames[i];
      j = 0;
      while (j < frame.length) {
        if (frame[j] !== _array[j]) {
          _array.get(j);
          _array.set(j, frame[j]);
        }
        j += 1;
      }
      i += 1;
    }

    window.f = frames;
    window.__array = _array;
  };

  lib['Native Sort'] = sort;

}(algorithms));/**
procedure sort(A : array):
    let maxdepth = ⌊log(length(A))⌋ × 2
    introsort(A, maxdepth)

procedure introsort(A, maxdepth):
    n ← length(A)
    if n ≤ 1:
        return  // base case
    else if maxdepth = 0:
        heapsort(A)
    else:
        p ← partition(A, p)  // assume this function does pivot selection
        introsort(A[0:p], maxdepth - 1)
        introsort(A[p+1:n], maxdepth - 1)
        **/
(function (lib) {

  var sort = function (list) {
    // var maxdepth = ~~Math.log(list.length) * 2;
    var maxdepth = 3;
    introsort(list, 0, list.length, maxdepth);
  };

  var introsort = function (list, start, end, maxdepth) {
    var p, n = end - start, temp, i;

    if (n <= 1) {
      return;
    } else if (maxdepth === 0) {
      window.indexOffset = start;
      temp = list.slice(start, end);
      algorithms.heapSort(temp);
      temp.forEach(function (element, index) {
        list.set(index + start, element);
      });
      window.indexOffset = 0;
    } else {
      p = partition(list, start, end);
      introsort(list, 0, p + 1, maxdepth - 1);
      introsort(list, p + 1, n, maxdepth - 1);
    }
  };

  var partition = function (list, start, end) {
    var len = end - start, p;
    p = Math.floor((end - start) / 3);
    // p = end;
    console.log('partitioning at :: ' + p);
    return p;
  };

  lib['Introspective Sort'] = sort;

}(algorithms));(function (lib) {

  var stoogeSort = function (list, i, j) {
    var t, length = list.length;

    if (typeof i === 'undefined') i = 0;
    if (typeof j === 'undefined') j = length - 1;

    if (list.get(i) < list.get(j)) {
      list.swap(i, j);
    }

    if (j - i + 1 > 2) {
      t = ~~((j - i + 1) / 3);
      stoogeSort(list, i, j - t);
      stoogeSort(list, i + t, j);
      stoogeSort(list, i, j - t);
    }

    return list;
  };

  lib.stoogeSort = stoogeSort;

}(algorithms));(function (lib) {

  /**
  procedure Straight Insertion Sort (X, n):
   X[0] := − ∞;
   for j := 2 to n do
   begin i := j − 1;
         t := X[j];
         while t < X[i] do
         begin X[i + 1] := X[i];
               i := i - 1
         end;
         X[i + 1] := t;
   end;
   **/

  var sort = function (list) {
    var i, j, length = list.length;

    list.set(0, -Infinity);
    j = 2;
    while (j < length) {
      i = j - 1;
      t = list.get(j);
      while (t < list.get(i)) {
        list.set(i + 1, list.get(i));
        i -= 1;
      }
      list.set(i + 1, t);
      j += 1;
    }
  }

  lib['Straight Insertion Sort'] = sort;

}(algorithms));(function (lib) {

  lib.bubbleSort = function (list) {
    var comparisons = 0,
      swaps = 0,
      endIndex = 0,
      len = list.length - 1,
      hasSwap = true,
      swapping,
      i, j;

    for (i = 0; i < len; i++) {
      hasSwap = false;
      for (j = 0, endIndex = len - i; j < endIndex; j++) {
        comparisons++;
        if (list.get(j) > list.get(j + 1)) {
          swapping = list.get(j);
          list.set(j, list.get(j + 1));
          list.set(j + 1, swapping);
          swaps++;
          hasSwap = true;
        };
      };
      if (!hasSwap) {
        break;
      }
    }

    return list;
  };

}(algorithms));(function (lib) {

  var buckets;

  var insertIntoBucket = function (radix, value) {
    if (!buckets[radix]) {
      buckets[radix] = [];
    }
    buckets[radix].push(value);
  };
  var countMaxNumDigits = function (array) {
    var len = array.length, element, max = -Infinity;
    while (len--) {
      element = array.get(len);
      max = Math.max(max, (element).toString().length);
    };
    return max;
  };

  var getDigitAt = function (number, index) {
    var s = (number).toString(),
      sArr = s.split('').reverse(),
      result = sArr[index];

    return typeof result == 'undefined' ? 0 : Number(result);
  };

  var sort = function (array) {
    var numPasses = countMaxNumDigits(array),
      currentDigitIndex = 0,
      i = 0, j = 0, k = 0, lastIndex,
      length = array.length,
      element, radix, bucket;

    while (currentDigitIndex < numPasses) {
      buckets = [];
      i = 0;
      while (i < length) {
        element = array.get(i);
        radix = getDigitAt(element, currentDigitIndex);
        insertIntoBucket(radix, element);
        i += 1;
      }
      i = 0;
      lastIndex = 0;
      while (i < 10) {
        bucket = buckets[i];
        if (!bucket) {
          i += 1;
          continue;
        }
        j = bucket.length;
        k = 0;
        while (k < j) {
          array.set(lastIndex, buckets[i][k]);
          lastIndex += 1;
          k += 1;
        }
        i += 1;
      }
      currentDigitIndex += 1;
    }
  }

  lib['LSD Bucket'] = sort;

}(algorithms));(function (lib) {

  // Sort an array in place and return the number of writes.
  var sort = function (array) {
    var writes = 0,
      cycleStart, position, item, i,
      length = array.length, swap;

    // Loop through the array to find cycles to rotate.
    for (cycleStart = 0; cycleStart <= length - 2; cycleStart += 1) {
      item = array.get(cycleStart);

      // Find where to put the item
      position = cycleStart;
      for (i = cycleStart + 1; i <= length; i += 1) {
        if (array.get(i) < item) {
          position += 1;
        }
      }

      // If the item is already there, this is not a cycle
      if (position === cycleStart) {
        continue;
      }

      // Otherwise put the item there or right after any duplicates.
      while (item === array.get(position)) {
        // Find where to put the item
        position += 1;
      }
      swap = array.get(position);
      array.set(position, item);
      item = swap;
      writes += 1;

      // Rotate the rest of the cycle
      while (position !== cycleStart) {
        // Find where to put the item
        position = cycleStart;
        for (i = cycleStart + 1; i < length; i += 1) {
          if (array.get(i) < item) {
            position += 1;
          }
        }
        // Put the item there or right after any duplicates.
        while (item === array.get(position)) {
          // Find where to put the item
          position += 1;
        }
        swap = array.get(position);
        array.set(position, item);
        item = swap;
        writes += 1;
      }
    }
  };

  lib.cycleSort = sort;

}(algorithms));(function (lib) {

  var sort = function (array) {
    var i,
      start = 0, end = array.length - 1,
      swapped = true,
      e1, e2;

    while (swapped && start <= end) {
      swapped = false;

      // start to end
      i = start;
      while (i <= end) {
        e1 = array.get(i);
        e2 = array.get(i + 1);
        if (e1 > e2) {
          swap = e2;
          array.set(i + 1, e1);
          array.set(i, swap);
          swapped = true;
        }
        i += 1;
      }
      start += 1;

      // end to start
      i = end;
      while (i >= start) {
        e1 = array.get(i);
        e2 = array.get(i - 1);
        if (e1 < e2) {
          swap = e2;
          array.set(i - 1, e1);
          array.set(i, swap);
          swapped = true;
        }
        i -= 1;
      }
      end -= 1;
    }
  };

  lib.cocktailSort = sort;

}(algorithms));(function (lib) {

  var sort = function (array) {
    // Sort an array a[0...n-1].
    var gaps = [1577, 701, 301, 132, 57, 23, 10, 4, 1],
      numGaps = gaps.length, currentGapIndex = 0, gap,
      n = array.length, temp;

    // Start with the largest gap and work down to a gap of 1 
    while (currentGapIndex < numGaps) {
      gap = gaps[currentGapIndex];
      // Do a gapped insertion sort for this gap size.
      // The first gap elements a[0..gap-1] are already in gapped order
      // keep adding one more element until the entire array is gap sorted 
      for (var i = gap; i < n; i += 1) {
        // add a[i] to the elements that have been gap sorted
        // save a[i] in temp and make a hole at position i
        temp = array.get(i);
          // shift earlier gap-sorted elements up until the correct location for a[i] is found
        for (var j = i; j >= gap && array.get(j - gap) > temp; j -= gap) {
          array.set(j, array.get(j - gap));
        }
        // put temp (the original a[i]) in its correct location
        array.set(j, temp);
      }
      currentGapIndex += 1;
    }
  }

  lib.gapSort = window.shellSort = sort;

}(algorithms));(function (lib) {
    /*jshint bitwise: false*/
    /*jshint noempty: false*/

    "use strict";
    /**
    * Sorts an array of integers using the AdaptiveSort algorithm.
    * @param {Array.<number>} items Array of items to be sorted.
    */

    /*
    * Adaptive merge sort algorithm
    * Implementation: Eugene Scherba, 11/9/2010
    * 
    * This is a stable sort algorithm, similar to merge sort except 
    * that it takes advantage of partially ordered "chains" (Donald 
    * Knuth refers to these structures as "runs"). Performance of this
    * algorithm is directly dependent on the amount of preexisting 
    * partial ordering, however generally it is pretty good even on
    * completely random arrays.
    *
    * Time complexity: O(n) if array is already sorted, 
    * O(n.log(n)) in a worst case which should be rare.
    * Space complexity: O(n) in worst case, usually around O(n/2).
    */

    function merge(left, right) {
        /*
        * Given two non-empty ordered arrays (chains), returns a new 
        * array containing an ordered union of the input chains.
        */
        var left_len = left.length,
        right_len = right.length,
        left_val,
        right_val,
        result;
        if (left[left_len - 1] <= (right_val = right.get(0))) {
            result = left.concat(right);
        } else if (right[right_len - 1] < (left_val = left.get(0))) {
            result = right.concat(left);
        } else {
            /* By this point, we know that the left and the right
            * arrays overlap by at least one element and simple
            * concatenation will not suffice to merge them. */

            result = new Array(left_len + right_len);
            var k = 0, h = 0;
            while (true) {
                if (right_val < left_val) {
                    result.set(k + h, right_val);
                    if (++h < right_len) {
                        right_val = right.get(h);
                    } else {
                        while (k < left_len) {
                            result.set(k + h, left.get(k++));
                        }
                        break;
                    }
                } else {
                    result.set(k + h, left_val);
                    if (++k < left_len) {
                        left_val = left.get(k);
                    } else {
                        while (h < right_len) {
                            result.set(k + h, right.get(h++));
                        }
                        break;
                    }
                }
            }
        }
        //setting array length to zero effectively removes the array from
        //memory (older versions of Firefox would leak unless these arrays
        //were reset).
        left.length = 0;
        right.length = 0;
        return result;
    }

    function find_fchain(arr, offset, limit) {
        /*
        * Given an array and offset equal to indexOf(elA), find    
        * the (indexOf(elZ) + 1) of an element elZ in the array,   
        * such that all elements elA..elZ form a non-strict 
        * forward-ordered chain.
        */
        var tmp, succ;
        for (tmp = arr.get(offset);
            ++offset < limit && tmp <= (succ = arr.get(offset));
            tmp = succ
        ) {}
        return offset;
    }

    function find_strict_rchain(arr, offset, limit) {
        /*
        * Given an array and offset equal to indexOf(elA), find   
        * the (indexOf(elZ) + 1) of an element elZ in the array,  
        * such that all elements elA..elZ form a strict 
        * reverse-ordered chain.
        */
        var tmp, succ;
        for (tmp = arr.get(offset);
            ++offset < limit && (succ = arr.get(offset)) < tmp;
            tmp = succ
        ) {}
        return offset;
    }

    function chain_unit(arr) {
        // Step 1: return an array of chain arrays
        // expecting data in reverse order
        var terminus,
        len = arr.length,
        tmp = [],
        f = find_strict_rchain;

        for (var k = 0; k < len; k = terminus) {
            // try to find a chain (ordered sequence of at least
            // two elements) using a default function first:

            terminus = f(arr, k, len);
            if (terminus - k > 1) {
                tmp.push(
                    (f === find_strict_rchain) ? 
                    arr.slice(k, terminus).reverse() : 
                    arr.slice(k, terminus)
                );
            } else if (f === find_strict_rchain) {
                /* searched for a reverse chain and found none:
                * switch default function to forward and look 
                * for a forward chain at k + 1: */

                tmp.push(arr.slice(k, ++terminus));
                f = find_fchain;
            } else {
                /* searched for a forward chain and found none:
                * switch default function to reverse and look 
                * for a reverse chain at k + 1: */

                tmp.push(arr.slice(k, ++terminus).reverse());
                f = find_strict_rchain;
            }
        }
        return tmp;
    }

    function chain_join(tmp) {
        // Step 2: join all chains
        var j = tmp.length;
        if (j < 1) { return tmp; }

        // note: we reduce the size of the array after each iteration,
        // which is not really necessary (could be done at once at the end).
        for (; j > 1; tmp.length = j) {
            var k, lim = j - 2;
            // At this point, lim == tmp.length - 2, so tmp.get(k + 1)
            // is always defined for any k in [0, lim)
            for (j = 0, k = 0; k < lim; k = j << 1) {
                tmp.set(j++, merge(tmp.get(k), tmp.get(k + 1)));
            }
            // Last pair is special -- its treatment depends on the initial 
            // parity of j, which is the same as the current parity of lim.
            tmp.set(j++, (k > lim) ? tmp.get(k) : merge(tmp.get(k), tmp.get(k + 1)));
        }
        var result = tmp.shift();
        return result;
    }

    function sort (arr) {

        // immutable version -- store result in a separate location
        return chain_join(chain_unit(arr));

        // mutable (standard) version -- store result in-place
        //var result = chain_join(chain_unit(arr));
        //for (var k = 0, len = arr.length; k < len; k++) {
        //    arr.get(k) = result.get(k);
        //}
        //result.length = 0;
        //return arr;
    };

    lib.adaptiveSort = sort;

})(algorithms);(function (lib) {

  var sort = function(array) {
    var length = array.length,
      min, i, j, minIndex, minValue;

    for (i = 0; i < length; i++) {
      minIndex = i;
      minValue = array.get(minIndex);

      for (j = i; j < length; j++) {
        if (array.get(j) < minValue) {
          minIndex = j;
          minValue = array.get(minIndex);
        }
      }

      // Move the smallest item to the beginning of the array.
      array.swap(minIndex, i);
    }

    return array;
  };

  lib.selectionSort = sort;

}(algorithms));(function(lib){
    "use strict";

    /**
    * Sorts an array of integers using the InsertionSort algorithm.
    * @param {Array.<number>} items Array of items to be sorted.
    */
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

})(algorithms);(function (lib) {

  var sort = function (array) {
    var position = 1, length = array.length, location;

    while (position < length) {
      if (array.get(position) >= array.get(position - 1)) {
        position = position + 1;
      } else {
        array.swap(position, position - 1);
        if (position > 1) {
          position -= 1;
        }
      }
    }
  };

  lib.gnomeSort = sort;

}(algorithms));(function (lib) {

  var sort = function (array) {
    var length = array.length, end;

    // Build the heap in array a so that largest value is at the root
    heapify(array);

    // The following loop maintains the invariants that a[0:end] is a heap and every element
    // beyond end is greater than everything before it (so a[end:count] is in sorted order)
    end = length - 1;

    while (end) {
      // a[0] is the root and largest value. The swap moves it in front of the sorted elements.
      array.swap(end, 0);

      // the heap size is reduced by one
      end -= 1;

      // the swap ruined the heap property, so restore it
      siftDown(array, 0, end);
    }
  };

  var heapify = function (array) {
    var count = array.length;

    // start is assigned the index in 'a' of the last parent node
    // the last element in a 0-based array is at index count-1; find the parent of that element
    var start = Math.floor( (count - 2) / 2 );

    while (start >= 0) {
      // sift down the node at index 'start' to the proper place such that all nodes below
      // the start index are in heap order
      siftDown(array, start, count - 1);

      // go to the next parent node
      start -= 1;
    }
  };

  var siftDown = function (array, start, end) {
    var root = start, child, swap;

    // While the root has at least one child
    while (root * 2 + 1 <= end) {
      // Left child
      child = root * 2 + 1;

      // Keeps track of child to swap with
      swap = root;

      if (array.get(swap) < array.get(child)) {
        swap = child;
      }

      // If there is a right child and that child is greater
      if (child + 1 <= end && array.get(swap) < array.get(child+1))  {
        swap = child + 1;
      }

      if (swap === root) {
        // The root holds the largest element. Since we assume the heaps rooted at the
        // children are valid, this means that we are done.
        return
      } else {
        array.swap(root, swap);
        // repeat to continue sifting down the child now
        root = swap;
      }
    }
  };

  lib.heapSort = sort;

}(algorithms));(function (lib) {
    /*jshint bitwise: false*/
    "use strict";

    /**
    * Quicksort algorithm. It's with complexity O(n log(n)).
    * In this version of quicksort I use the middle element of the
    * array for pivot.
    */


    /**
    * Quicksort algorithm
    *
    * @public
    * @param {array} array Array which should be sorted.
    * @return {array} Sorted array.
    */

    /**
    * Partitions the array in two parts by the middle elements.
    * All elemnts which are less than the chosen one goes left from it
    * all which are greater goes right from it.
    *
    * @param {array} array Array which should be partitioned
    * @param {number} left Left part of the array
    * @param {number} right Right part of the array
    * @return {number}
    */
    function partition(array, left, right) {
        var pivot = array.get((left + right) >>> 1);
        while (left <= right) {
            while (array.get(left) < pivot) { left++; }
            while (array.get(right) > pivot) { right--; }
            if (left <= right) {
                var temp = array.get(left);
                array.set(left++, array.get(right));
                array.set(right--, temp);
            }
        }
        return left;
    }

    /**
    * Recursively calls itself with different values for
    * left/right part of the array which should be processed
    *
    * @private
    * @param {array} array Array which should be processed
    * @param {number} left Left part of the array which should be processed
    * @param {number} right Right part of the array which should be processed
    */
    function quicksort(array, left, right) {
        var mid = partition(array, left, right);
        if (left < mid - 1) {
            quicksort(array, left, mid - 1);
        }
        if (right > mid) {
            quicksort(array, mid, right);
        }
    }

    /**
    * Quicksort's initial point
    * @public
    */
    lib.quickmiddleSort = function (items) {
        quicksort(items, 0, items.length - 1);
        return items;
    };

}(algorithms));/**
 * An implementation for Quicksort. Doesn't
 * perform as well as the native Array.sort
 * and also runs the risk of a stack overflow
 *
 * Tests with:
 *
 * var array = [];
 * for(var i = 0; i < 20; i++) {
 *   array.push(Math.round(Math.random() * 100));
 * }
 *
 * Quicksort.sort(array);
 *
 * @author Paul Lewis
 */
algorithms.quickSort = (function _quickSort() {
 
  /**
   * Swaps two values in the heap
   *
   * @param {int} indexA Index of the first item to be swapped
   * @param {int} indexB Index of the second item to be swapped
   */
  function swap(array, indexA, indexB) {
    var temp = array.get(indexA);
    array.set(indexA, array.get(indexB));
    array.set(indexB, temp);
  }
 
  /**
   * Partitions the (sub)array into values less than and greater
   * than the pivot value
   *
   * @param {Array} array The target array
   * @param {int} pivot The index of the pivot
   * @param {int} left The index of the leftmost element
   * @param {int} left The index of the rightmost element
   */
  function partition(array, pivot, left, right) {
 
    var storeIndex = left,
        pivotValue = array.get(pivot);
 
    // put the pivot on the right
    swap(array, pivot, right);
 
    // go through the rest
    for(var v = left; v < right; v++) {
 
      // if the value is less than the pivot's
      // value put it to the left of the pivot
      // point and move the pivot point along one
      if(array.get(v) < pivotValue) {
        swap(array, v, storeIndex);
        storeIndex++;
      }
    }
 
    // finally put the pivot in the correct place
    swap(array, right, storeIndex);
 
    return storeIndex;
  }
 
  /**
   * Sorts the (sub-)array
   *
   * @param {Array} array The target array
   * @param {int} left The index of the leftmost element, defaults 0
   * @param {int} left The index of the rightmost element,
   defaults array.length-1
   */
  function sort(array, left, right) {
 
    var pivot = null;
 
    if(typeof left !== 'number') {
      left = 0;
    }
 
    if(typeof right !== 'number') {
      right = array.length - 1;
    }
 
    // effectively set our base
    // case here. When left == right
    // we'll stop
    if(left < right) {
 
      // pick a pivot between left and right
      // and update it once we've partitioned
      // the array to values < than or > than
      // the pivot value
      pivot     = left + Math.ceil((right - left) * 0.5);
      newPivot  = partition(array, pivot, left, right);
 
      // recursively sort to the left and right
      sort(array, left, newPivot - 1);
      sort(array, newPivot + 1, right);
    }
 
  }
 
  return {
    sort: sort
  };
 
}()).sort;(function (lib) {

  var mergeSort = function (array, startIndex, endIndex) {
    var length = array.length,
      middle, leftStart, leftEnd, rightStart, rightEnd,
      sortedLeft, sortedRight;

    if (length <= 1) {
      return array;
    }
    if (endIndex - startIndex === 0) {
      return array.get(endIndex);
    }

    if (typeof startIndex == 'undefined') {
      startIndex = 0;
    }
    if (typeof endIndex == 'undefined') {
      endIndex = length - 1;
    }

    middle = startIndex + Math.floor((endIndex - startIndex) / 2);
    leftStart = startIndex;
    leftEnd = middle;
    rightStart = middle + 1;
    rightEnd = endIndex;

    sortedLeft = mergeSort(array, leftStart, leftEnd);
    sortedRight = mergeSort(array, rightStart, rightEnd);

    merge(array, leftStart, leftEnd, rightStart, rightEnd);
  };

  var merge = function (array, leftStart, leftEnd, rightStart, rightEnd) {
    var list = [],
      leftIndex = leftStart,
      rightIndex = rightStart,
      leftElement, rightElement,
      i, numElements;

    while (leftIndex <= leftEnd && rightIndex <= rightEnd) {
      leftElement = array.get(leftIndex);
      rightElement = array.get(rightIndex);
      if (leftElement < rightElement) {
        list.push(leftElement);
        leftIndex += 1;
      } else {
        list.push(rightElement);
        rightIndex += 1;
      }
    }
    while (leftIndex <= leftEnd) {
      leftElement = array.get(leftIndex);
      list.push(leftElement);
      leftIndex += 1;
    }
    while (rightIndex <= rightEnd) {
      rightElement = array.get(rightIndex);
      list.push(rightElement);
      rightIndex += 1;
    }

    numElements = list.length;
    for (i = 0; i < numElements; i += 1) {
      array.set(leftStart + i, list[i]);
    }
  };

  lib.mergeSort = mergeSort;

}(algorithms));