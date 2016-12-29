(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Draggabilly v2.1.1
 * Make that shiz draggable
 * http://draggabilly.desandro.com
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'get-size/get-size',
        'unidragger/unidragger'
      ],
      function( getSize, Unidragger ) {
        return factory( window, getSize, Unidragger );
      });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('get-size'),
      require('unidragger')
    );
  } else {
    // browser global
    window.Draggabilly = factory(
      window,
      window.getSize,
      window.Unidragger
    );
  }

}( window, function factory( window, getSize, Unidragger ) {

'use strict';

// vars
var document = window.document;

function noop() {}

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

function isElement( obj ) {
  return obj instanceof HTMLElement;
}

// -------------------------- requestAnimationFrame -------------------------- //

// get rAF, prefixed, if present
var requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

// fallback to setTimeout
var lastTime = 0;
if ( !requestAnimationFrame )  {
  requestAnimationFrame = function( callback ) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
    var id = setTimeout( callback, timeToCall );
    lastTime = currTime + timeToCall;
    return id;
  };
}

// -------------------------- support -------------------------- //

var docElem = document.documentElement;
var transformProperty = typeof docElem.style.transform == 'string' ?
  'transform' : 'WebkitTransform';

var jQuery = window.jQuery;

// --------------------------  -------------------------- //

function Draggabilly( element, options ) {
  // querySelector if string
  this.element = typeof element == 'string' ?
    document.querySelector( element ) : element;

  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }

  // options
  this.options = extend( {}, this.constructor.defaults );
  this.option( options );

  this._create();
}

// inherit Unidragger methods
var proto = Draggabilly.prototype = Object.create( Unidragger.prototype );

Draggabilly.defaults = {
};

/**
 * set options
 * @param {Object} opts
 */
proto.option = function( opts ) {
  extend( this.options, opts );
};

// css position values that don't need to be set
var positionValues = {
  relative: true,
  absolute: true,
  fixed: true
};

proto._create = function() {

  // properties
  this.position = {};
  this._getPosition();

  this.startPoint = { x: 0, y: 0 };
  this.dragPoint = { x: 0, y: 0 };

  this.startPosition = extend( {}, this.position );

  // set relative positioning
  var style = getComputedStyle( this.element );
  if ( !positionValues[ style.position ] ) {
    this.element.style.position = 'relative';
  }

  this.enable();
  this.setHandles();

};

/**
 * set this.handles and bind start events to 'em
 */
proto.setHandles = function() {
  this.handles = this.options.handle ?
    this.element.querySelectorAll( this.options.handle ) : [ this.element ];

  this.bindHandles();
};

/**
 * emits events via EvEmitter and jQuery events
 * @param {String} type - name of event
 * @param {Event} event - original event
 * @param {Array} args - extra arguments
 */
proto.dispatchEvent = function( type, event, args ) {
  var emitArgs = [ event ].concat( args );
  this.emitEvent( type, emitArgs );
  var jQuery = window.jQuery;
  // trigger jQuery event
  if ( jQuery && this.$element ) {
    if ( event ) {
      // create jQuery event
      var $event = jQuery.Event( event );
      $event.type = type;
      this.$element.trigger( $event, args );
    } else {
      // just trigger with type if no event available
      this.$element.trigger( type, args );
    }
  }
};

// -------------------------- position -------------------------- //

// get x/y position from style
proto._getPosition = function() {
  var style = getComputedStyle( this.element );
  var x = this._getPositionCoord( style.left, 'width' );
  var y = this._getPositionCoord( style.top, 'height' );
  // clean up 'auto' or other non-integer values
  this.position.x = isNaN( x ) ? 0 : x;
  this.position.y = isNaN( y ) ? 0 : y;

  this._addTransformPosition( style );
};

proto._getPositionCoord = function( styleSide, measure ) {
  if ( styleSide.indexOf('%') != -1 ) {
    // convert percent into pixel for Safari, #75
    var parentSize = getSize( this.element.parentNode );
    // prevent not-in-DOM element throwing bug, #131
    return !parentSize ? 0 :
      ( parseFloat( styleSide ) / 100 ) * parentSize[ measure ];
  }
  return parseInt( styleSide, 10 );
};

// add transform: translate( x, y ) to position
proto._addTransformPosition = function( style ) {
  var transform = style[ transformProperty ];
  // bail out if value is 'none'
  if ( transform.indexOf('matrix') !== 0 ) {
    return;
  }
  // split matrix(1, 0, 0, 1, x, y)
  var matrixValues = transform.split(',');
  // translate X value is in 12th or 4th position
  var xIndex = transform.indexOf('matrix3d') === 0 ? 12 : 4;
  var translateX = parseInt( matrixValues[ xIndex ], 10 );
  // translate Y value is in 13th or 5th position
  var translateY = parseInt( matrixValues[ xIndex + 1 ], 10 );
  this.position.x += translateX;
  this.position.y += translateY;
};

// -------------------------- events -------------------------- //

/**
 * pointer start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerDown = function( event, pointer ) {
  this._dragPointerDown( event, pointer );
  // kludge to blur focused inputs in dragger
  var focused = document.activeElement;
  // do not blur body for IE10, metafizzy/flickity#117
  if ( focused && focused.blur && focused != document.body ) {
    focused.blur();
  }
  // bind move and end events
  this._bindPostStartEvents( event );
  this.element.classList.add('is-pointer-down');
  this.dispatchEvent( 'pointerDown', event, [ pointer ] );
};

/**
 * drag move
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerMove = function( event, pointer ) {
  var moveVector = this._dragPointerMove( event, pointer );
  this.dispatchEvent( 'pointerMove', event, [ pointer, moveVector ] );
  this._dragMove( event, pointer, moveVector );
};

/**
 * drag start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.dragStart = function( event, pointer ) {
  if ( !this.isEnabled ) {
    return;
  }
  this._getPosition();
  this.measureContainment();
  // position _when_ drag began
  this.startPosition.x = this.position.x;
  this.startPosition.y = this.position.y;
  // reset left/top style
  this.setLeftTop();

  this.dragPoint.x = 0;
  this.dragPoint.y = 0;

  this.element.classList.add('is-dragging');
  this.dispatchEvent( 'dragStart', event, [ pointer ] );
  // start animation
  this.animate();
};

proto.measureContainment = function() {
  var containment = this.options.containment;
  if ( !containment ) {
    return;
  }

  // use element if element
  var container = isElement( containment ) ? containment :
    // fallback to querySelector if string
    typeof containment == 'string' ? document.querySelector( containment ) :
    // otherwise just `true`, use the parent
    this.element.parentNode;

  var elemSize = getSize( this.element );
  var containerSize = getSize( container );
  var elemRect = this.element.getBoundingClientRect();
  var containerRect = container.getBoundingClientRect();

  var borderSizeX = containerSize.borderLeftWidth + containerSize.borderRightWidth;
  var borderSizeY = containerSize.borderTopWidth + containerSize.borderBottomWidth;

  var position = this.relativeStartPosition = {
    x: elemRect.left - ( containerRect.left + containerSize.borderLeftWidth ),
    y: elemRect.top - ( containerRect.top + containerSize.borderTopWidth )
  };

  this.containSize = {
    width: ( containerSize.width - borderSizeX ) - position.x - elemSize.width,
    height: ( containerSize.height - borderSizeY ) - position.y - elemSize.height
  };
};

// ----- move event ----- //

/**
 * drag move
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.dragMove = function( event, pointer, moveVector ) {
  if ( !this.isEnabled ) {
    return;
  }
  var dragX = moveVector.x;
  var dragY = moveVector.y;

  var grid = this.options.grid;
  var gridX = grid && grid[0];
  var gridY = grid && grid[1];

  dragX = applyGrid( dragX, gridX );
  dragY = applyGrid( dragY, gridY );

  dragX = this.containDrag( 'x', dragX, gridX );
  dragY = this.containDrag( 'y', dragY, gridY );

  // constrain to axis
  dragX = this.options.axis == 'y' ? 0 : dragX;
  dragY = this.options.axis == 'x' ? 0 : dragY;

  this.position.x = this.startPosition.x + dragX;
  this.position.y = this.startPosition.y + dragY;
  // set dragPoint properties
  this.dragPoint.x = dragX;
  this.dragPoint.y = dragY;

  this.dispatchEvent( 'dragMove', event, [ pointer, moveVector ] );
};

function applyGrid( value, grid, method ) {
  method = method || 'round';
  return grid ? Math[ method ]( value / grid ) * grid : value;
}

proto.containDrag = function( axis, drag, grid ) {
  if ( !this.options.containment ) {
    return drag;
  }
  var measure = axis == 'x' ? 'width' : 'height';

  var rel = this.relativeStartPosition[ axis ];
  var min = applyGrid( -rel, grid, 'ceil' );
  var max = this.containSize[ measure ];
  max = applyGrid( max, grid, 'floor' );
  return  Math.min( max, Math.max( min, drag ) );
};

// ----- end event ----- //

/**
 * pointer up
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerUp = function( event, pointer ) {
  this.element.classList.remove('is-pointer-down');
  this.dispatchEvent( 'pointerUp', event, [ pointer ] );
  this._dragPointerUp( event, pointer );
};

/**
 * drag end
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.dragEnd = function( event, pointer ) {
  if ( !this.isEnabled ) {
    return;
  }
  // use top left position when complete
  if ( transformProperty ) {
    this.element.style[ transformProperty ] = '';
    this.setLeftTop();
  }
  this.element.classList.remove('is-dragging');
  this.dispatchEvent( 'dragEnd', event, [ pointer ] );
};

// -------------------------- animation -------------------------- //

proto.animate = function() {
  // only render and animate if dragging
  if ( !this.isDragging ) {
    return;
  }

  this.positionDrag();

  var _this = this;
  requestAnimationFrame( function animateFrame() {
    _this.animate();
  });

};

// left/top positioning
proto.setLeftTop = function() {
  this.element.style.left = this.position.x + 'px';
  this.element.style.top  = this.position.y + 'px';
};

proto.positionDrag = function() {
  this.element.style[ transformProperty ] = 'translate3d( ' + this.dragPoint.x +
    'px, ' + this.dragPoint.y + 'px, 0)';
};

// ----- staticClick ----- //

proto.staticClick = function( event, pointer ) {
  this.dispatchEvent( 'staticClick', event, [ pointer ] );
};

// ----- methods ----- //

proto.enable = function() {
  this.isEnabled = true;
};

proto.disable = function() {
  this.isEnabled = false;
  if ( this.isDragging ) {
    this.dragEnd();
  }
};

proto.destroy = function() {
  this.disable();
  // reset styles
  this.element.style[ transformProperty ] = '';
  this.element.style.left = '';
  this.element.style.top = '';
  this.element.style.position = '';
  // unbind handles
  this.unbindHandles();
  // remove jQuery data
  if ( this.$element ) {
    this.$element.removeData('draggabilly');
  }
};

// ----- jQuery bridget ----- //

// required for jQuery bridget
proto._init = noop;

if ( jQuery && jQuery.bridget ) {
  jQuery.bridget( 'draggabilly', Draggabilly );
}

// -----  ----- //

return Draggabilly;

}));

},{"get-size":3,"unidragger":4}],2:[function(require,module,exports){
/**
 * EvEmitter v1.0.3
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

( function( global, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, window */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {

"use strict";

function EvEmitter() {}

var proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // set events hash
  var events = this._events = this._events || {};
  // set listeners array
  var listeners = events[ eventName ] = events[ eventName ] || [];
  // only add once
  if ( listeners.indexOf( listener ) == -1 ) {
    listeners.push( listener );
  }

  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  var onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;

  return this;
};

proto.off = function( eventName, listener ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var index = listeners.indexOf( listener );
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var i = 0;
  var listener = listeners[i];
  args = args || [];
  // once stuff
  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  while ( listener ) {
    var isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // remove listener
      // remove before trigger to prevent recursion
      this.off( eventName, listener );
      // unset once flag
      delete onceListeners[ listener ];
    }
    // trigger listener
    listener.apply( this, args );
    // get next listener
    i += isOnce ? 0 : 1;
    listener = listeners[i];
  }

  return this;
};

return EvEmitter;

}));

},{}],3:[function(require,module,exports){
/*!
 * getSize v2.0.2
 * measure size of elements
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false, console: false */

( function( window, factory ) {
  'use strict';

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( function() {
      return factory();
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    window.getSize = factory();
  }

})( window, function factory() {
'use strict';

// -------------------------- helpers -------------------------- //

// get a number from a string, not a percentage
function getStyleSize( value ) {
  var num = parseFloat( value );
  // not a percent like '100%', and a number
  var isValid = value.indexOf('%') == -1 && !isNaN( num );
  return isValid && num;
}

function noop() {}

var logError = typeof console == 'undefined' ? noop :
  function( message ) {
    console.error( message );
  };

// -------------------------- measurements -------------------------- //

var measurements = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'borderLeftWidth',
  'borderRightWidth',
  'borderTopWidth',
  'borderBottomWidth'
];

var measurementsLength = measurements.length;

function getZeroSize() {
  var size = {
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
    outerWidth: 0,
    outerHeight: 0
  };
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    size[ measurement ] = 0;
  }
  return size;
}

// -------------------------- getStyle -------------------------- //

/**
 * getStyle, get style of element, check for Firefox bug
 * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 */
function getStyle( elem ) {
  var style = getComputedStyle( elem );
  if ( !style ) {
    logError( 'Style returned ' + style +
      '. Are you running this code in a hidden iframe on Firefox? ' +
      'See http://bit.ly/getsizebug1' );
  }
  return style;
}

// -------------------------- setup -------------------------- //

var isSetup = false;

var isBoxSizeOuter;

/**
 * setup
 * check isBoxSizerOuter
 * do on first getSize() rather than on page load for Firefox bug
 */
function setup() {
  // setup once
  if ( isSetup ) {
    return;
  }
  isSetup = true;

  // -------------------------- box sizing -------------------------- //

  /**
   * WebKit measures the outer-width on style.width on border-box elems
   * IE & Firefox<29 measures the inner-width
   */
  var div = document.createElement('div');
  div.style.width = '200px';
  div.style.padding = '1px 2px 3px 4px';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px 2px 3px 4px';
  div.style.boxSizing = 'border-box';

  var body = document.body || document.documentElement;
  body.appendChild( div );
  var style = getStyle( div );

  getSize.isBoxSizeOuter = isBoxSizeOuter = getStyleSize( style.width ) == 200;
  body.removeChild( div );

}

// -------------------------- getSize -------------------------- //

function getSize( elem ) {
  setup();

  // use querySeletor if elem is string
  if ( typeof elem == 'string' ) {
    elem = document.querySelector( elem );
  }

  // do not proceed on non-objects
  if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
    return;
  }

  var style = getStyle( elem );

  // if hidden, everything is 0
  if ( style.display == 'none' ) {
    return getZeroSize();
  }

  var size = {};
  size.width = elem.offsetWidth;
  size.height = elem.offsetHeight;

  var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

  // get all measurements
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    var value = style[ measurement ];
    var num = parseFloat( value );
    // any 'auto', 'medium' value will be 0
    size[ measurement ] = !isNaN( num ) ? num : 0;
  }

  var paddingWidth = size.paddingLeft + size.paddingRight;
  var paddingHeight = size.paddingTop + size.paddingBottom;
  var marginWidth = size.marginLeft + size.marginRight;
  var marginHeight = size.marginTop + size.marginBottom;
  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

  // overwrite width and height if we can get it from style
  var styleWidth = getStyleSize( style.width );
  if ( styleWidth !== false ) {
    size.width = styleWidth +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
  }

  var styleHeight = getStyleSize( style.height );
  if ( styleHeight !== false ) {
    size.height = styleHeight +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
  }

  size.innerWidth = size.width - ( paddingWidth + borderWidth );
  size.innerHeight = size.height - ( paddingHeight + borderHeight );

  size.outerWidth = size.width + marginWidth;
  size.outerHeight = size.height + marginHeight;

  return size;
}

return getSize;

});

},{}],4:[function(require,module,exports){
/*!
 * Unidragger v2.1.0
 * Draggable base class
 * MIT license
 */

/*jshint browser: true, unused: true, undef: true, strict: true */

( function( window, factory ) {
  // universal module definition
  /*jshint strict: false */ /*globals define, module, require */

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'unipointer/unipointer'
    ], function( Unipointer ) {
      return factory( window, Unipointer );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('unipointer')
    );
  } else {
    // browser global
    window.Unidragger = factory(
      window,
      window.Unipointer
    );
  }

}( window, function factory( window, Unipointer ) {

'use strict';

// -----  ----- //

function noop() {}

// -------------------------- Unidragger -------------------------- //

function Unidragger() {}

// inherit Unipointer & EvEmitter
var proto = Unidragger.prototype = Object.create( Unipointer.prototype );

// ----- bind start ----- //

proto.bindHandles = function() {
  this._bindHandles( true );
};

proto.unbindHandles = function() {
  this._bindHandles( false );
};

var navigator = window.navigator;
/**
 * works as unbinder, as you can .bindHandles( false ) to unbind
 * @param {Boolean} isBind - will unbind if falsey
 */
proto._bindHandles = function( isBind ) {
  // munge isBind, default to true
  isBind = isBind === undefined ? true : !!isBind;
  // extra bind logic
  var binderExtra;
  if ( navigator.pointerEnabled ) {
    binderExtra = function( handle ) {
      // disable scrolling on the element
      handle.style.touchAction = isBind ? 'none' : '';
    };
  } else if ( navigator.msPointerEnabled ) {
    binderExtra = function( handle ) {
      // disable scrolling on the element
      handle.style.msTouchAction = isBind ? 'none' : '';
    };
  } else {
    binderExtra = noop;
  }
  // bind each handle
  var bindMethod = isBind ? 'addEventListener' : 'removeEventListener';
  for ( var i=0; i < this.handles.length; i++ ) {
    var handle = this.handles[i];
    this._bindStartEvent( handle, isBind );
    binderExtra( handle );
    handle[ bindMethod ]( 'click', this );
  }
};

// ----- start event ----- //

/**
 * pointer start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerDown = function( event, pointer ) {
  // dismiss range sliders
  if ( event.target.nodeName == 'INPUT' && event.target.type == 'range' ) {
    // reset pointerDown logic
    this.isPointerDown = false;
    delete this.pointerIdentifier;
    return;
  }

  this._dragPointerDown( event, pointer );
  // kludge to blur focused inputs in dragger
  var focused = document.activeElement;
  if ( focused && focused.blur ) {
    focused.blur();
  }
  // bind move and end events
  this._bindPostStartEvents( event );
  this.emitEvent( 'pointerDown', [ event, pointer ] );
};

// base pointer down logic
proto._dragPointerDown = function( event, pointer ) {
  // track to see when dragging starts
  this.pointerDownPoint = Unipointer.getPointerPoint( pointer );

  var canPreventDefault = this.canPreventDefaultOnPointerDown( event, pointer );
  if ( canPreventDefault ) {
    event.preventDefault();
  }
};

// overwriteable method so Flickity can prevent for scrolling
proto.canPreventDefaultOnPointerDown = function( event ) {
  // prevent default, unless touchstart or <select>
  return event.target.nodeName != 'SELECT';
};

// ----- move event ----- //

/**
 * drag move
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerMove = function( event, pointer ) {
  var moveVector = this._dragPointerMove( event, pointer );
  this.emitEvent( 'pointerMove', [ event, pointer, moveVector ] );
  this._dragMove( event, pointer, moveVector );
};

// base pointer move logic
proto._dragPointerMove = function( event, pointer ) {
  var movePoint = Unipointer.getPointerPoint( pointer );
  var moveVector = {
    x: movePoint.x - this.pointerDownPoint.x,
    y: movePoint.y - this.pointerDownPoint.y
  };
  // start drag if pointer has moved far enough to start drag
  if ( !this.isDragging && this.hasDragStarted( moveVector ) ) {
    this._dragStart( event, pointer );
  }
  return moveVector;
};

// condition if pointer has moved far enough to start drag
proto.hasDragStarted = function( moveVector ) {
  return Math.abs( moveVector.x ) > 3 || Math.abs( moveVector.y ) > 3;
};


// ----- end event ----- //

/**
 * pointer up
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto.pointerUp = function( event, pointer ) {
  this.emitEvent( 'pointerUp', [ event, pointer ] );
  this._dragPointerUp( event, pointer );
};

proto._dragPointerUp = function( event, pointer ) {
  if ( this.isDragging ) {
    this._dragEnd( event, pointer );
  } else {
    // pointer didn't move enough for drag to start
    this._staticClick( event, pointer );
  }
};

// -------------------------- drag -------------------------- //

// dragStart
proto._dragStart = function( event, pointer ) {
  this.isDragging = true;
  this.dragStartPoint = Unipointer.getPointerPoint( pointer );
  // prevent clicks
  this.isPreventingClicks = true;

  this.dragStart( event, pointer );
};

proto.dragStart = function( event, pointer ) {
  this.emitEvent( 'dragStart', [ event, pointer ] );
};

// dragMove
proto._dragMove = function( event, pointer, moveVector ) {
  // do not drag if not dragging yet
  if ( !this.isDragging ) {
    return;
  }

  this.dragMove( event, pointer, moveVector );
};

proto.dragMove = function( event, pointer, moveVector ) {
  event.preventDefault();
  this.emitEvent( 'dragMove', [ event, pointer, moveVector ] );
};

// dragEnd
proto._dragEnd = function( event, pointer ) {
  // set flags
  this.isDragging = false;
  // re-enable clicking async
  setTimeout( function() {
    delete this.isPreventingClicks;
  }.bind( this ) );

  this.dragEnd( event, pointer );
};

proto.dragEnd = function( event, pointer ) {
  this.emitEvent( 'dragEnd', [ event, pointer ] );
};

// ----- onclick ----- //

// handle all clicks and prevent clicks when dragging
proto.onclick = function( event ) {
  if ( this.isPreventingClicks ) {
    event.preventDefault();
  }
};

// ----- staticClick ----- //

// triggered after pointer down & up with no/tiny movement
proto._staticClick = function( event, pointer ) {
  // ignore emulated mouse up clicks
  if ( this.isIgnoringMouseUp && event.type == 'mouseup' ) {
    return;
  }

  // allow click in <input>s and <textarea>s
  var nodeName = event.target.nodeName;
  if ( nodeName == 'INPUT' || nodeName == 'TEXTAREA' ) {
    event.target.focus();
  }
  this.staticClick( event, pointer );

  // set flag for emulated clicks 300ms after touchend
  if ( event.type != 'mouseup' ) {
    this.isIgnoringMouseUp = true;
    // reset flag after 300ms
    setTimeout( function() {
      delete this.isIgnoringMouseUp;
    }.bind( this ), 400 );
  }
};

proto.staticClick = function( event, pointer ) {
  this.emitEvent( 'staticClick', [ event, pointer ] );
};

// ----- utils ----- //

Unidragger.getPointerPoint = Unipointer.getPointerPoint;

// -----  ----- //

return Unidragger;

}));

},{"unipointer":5}],5:[function(require,module,exports){
/*!
 * Unipointer v2.1.0
 * base class for doing one thing with pointer event
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true, strict: true */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*global define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'ev-emitter/ev-emitter'
    ], function( EvEmitter ) {
      return factory( window, EvEmitter );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('ev-emitter')
    );
  } else {
    // browser global
    window.Unipointer = factory(
      window,
      window.EvEmitter
    );
  }

}( window, function factory( window, EvEmitter ) {

'use strict';

function noop() {}

function Unipointer() {}

// inherit EvEmitter
var proto = Unipointer.prototype = Object.create( EvEmitter.prototype );

proto.bindStartEvent = function( elem ) {
  this._bindStartEvent( elem, true );
};

proto.unbindStartEvent = function( elem ) {
  this._bindStartEvent( elem, false );
};

/**
 * works as unbinder, as you can ._bindStart( false ) to unbind
 * @param {Boolean} isBind - will unbind if falsey
 */
proto._bindStartEvent = function( elem, isBind ) {
  // munge isBind, default to true
  isBind = isBind === undefined ? true : !!isBind;
  var bindMethod = isBind ? 'addEventListener' : 'removeEventListener';

  if ( window.navigator.pointerEnabled ) {
    // W3C Pointer Events, IE11. See https://coderwall.com/p/mfreca
    elem[ bindMethod ]( 'pointerdown', this );
  } else if ( window.navigator.msPointerEnabled ) {
    // IE10 Pointer Events
    elem[ bindMethod ]( 'MSPointerDown', this );
  } else {
    // listen for both, for devices like Chrome Pixel
    elem[ bindMethod ]( 'mousedown', this );
    elem[ bindMethod ]( 'touchstart', this );
  }
};

// trigger handler methods for events
proto.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// returns the touch that we're keeping track of
proto.getTouch = function( touches ) {
  for ( var i=0; i < touches.length; i++ ) {
    var touch = touches[i];
    if ( touch.identifier == this.pointerIdentifier ) {
      return touch;
    }
  }
};

// ----- start event ----- //

proto.onmousedown = function( event ) {
  // dismiss clicks from right or middle buttons
  var button = event.button;
  if ( button && ( button !== 0 && button !== 1 ) ) {
    return;
  }
  this._pointerDown( event, event );
};

proto.ontouchstart = function( event ) {
  this._pointerDown( event, event.changedTouches[0] );
};

proto.onMSPointerDown =
proto.onpointerdown = function( event ) {
  this._pointerDown( event, event );
};

/**
 * pointer start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
proto._pointerDown = function( event, pointer ) {
  // dismiss other pointers
  if ( this.isPointerDown ) {
    return;
  }

  this.isPointerDown = true;
  // save pointer identifier to match up touch events
  this.pointerIdentifier = pointer.pointerId !== undefined ?
    // pointerId for pointer events, touch.indentifier for touch events
    pointer.pointerId : pointer.identifier;

  this.pointerDown( event, pointer );
};

proto.pointerDown = function( event, pointer ) {
  this._bindPostStartEvents( event );
  this.emitEvent( 'pointerDown', [ event, pointer ] );
};

// hash of events to be bound after start event
var postStartEvents = {
  mousedown: [ 'mousemove', 'mouseup' ],
  touchstart: [ 'touchmove', 'touchend', 'touchcancel' ],
  pointerdown: [ 'pointermove', 'pointerup', 'pointercancel' ],
  MSPointerDown: [ 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel' ]
};

proto._bindPostStartEvents = function( event ) {
  if ( !event ) {
    return;
  }
  // get proper events to match start event
  var events = postStartEvents[ event.type ];
  // bind events to node
  events.forEach( function( eventName ) {
    window.addEventListener( eventName, this );
  }, this );
  // save these arguments
  this._boundPointerEvents = events;
};

proto._unbindPostStartEvents = function() {
  // check for _boundEvents, in case dragEnd triggered twice (old IE8 bug)
  if ( !this._boundPointerEvents ) {
    return;
  }
  this._boundPointerEvents.forEach( function( eventName ) {
    window.removeEventListener( eventName, this );
  }, this );

  delete this._boundPointerEvents;
};

// ----- move event ----- //

proto.onmousemove = function( event ) {
  this._pointerMove( event, event );
};

proto.onMSPointerMove =
proto.onpointermove = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this._pointerMove( event, event );
  }
};

proto.ontouchmove = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this._pointerMove( event, touch );
  }
};

/**
 * pointer move
 * @param {Event} event
 * @param {Event or Touch} pointer
 * @private
 */
proto._pointerMove = function( event, pointer ) {
  this.pointerMove( event, pointer );
};

// public
proto.pointerMove = function( event, pointer ) {
  this.emitEvent( 'pointerMove', [ event, pointer ] );
};

// ----- end event ----- //


proto.onmouseup = function( event ) {
  this._pointerUp( event, event );
};

proto.onMSPointerUp =
proto.onpointerup = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this._pointerUp( event, event );
  }
};

proto.ontouchend = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this._pointerUp( event, touch );
  }
};

/**
 * pointer up
 * @param {Event} event
 * @param {Event or Touch} pointer
 * @private
 */
proto._pointerUp = function( event, pointer ) {
  this._pointerDone();
  this.pointerUp( event, pointer );
};

// public
proto.pointerUp = function( event, pointer ) {
  this.emitEvent( 'pointerUp', [ event, pointer ] );
};

// ----- pointer done ----- //

// triggered on pointer up & pointer cancel
proto._pointerDone = function() {
  // reset properties
  this.isPointerDown = false;
  delete this.pointerIdentifier;
  // remove events
  this._unbindPostStartEvents();
  this.pointerDone();
};

proto.pointerDone = noop;

// ----- pointer cancel ----- //

proto.onMSPointerCancel =
proto.onpointercancel = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this._pointerCancel( event, event );
  }
};

proto.ontouchcancel = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this._pointerCancel( event, touch );
  }
};

/**
 * pointer cancel
 * @param {Event} event
 * @param {Event or Touch} pointer
 * @private
 */
proto._pointerCancel = function( event, pointer ) {
  this._pointerDone();
  this.pointerCancel( event, pointer );
};

// public
proto.pointerCancel = function( event, pointer ) {
  this.emitEvent( 'pointerCancel', [ event, pointer ] );
};

// -----  ----- //

// utility function for getting x/y coords from event
Unipointer.getPointerPoint = function( pointer ) {
  return {
    x: pointer.pageX,
    y: pointer.pageY
  };
};

// -----  ----- //

return Unipointer;

}));

},{"ev-emitter":2}],6:[function(require,module,exports){
// jshint esversion: 6

(function (root, factory) { // Universal module definition.
  // See: <https://github.com/umdjs/umd/tree/master/templates>

  if (typeof define === 'function' && define.amd) {

    // AMD / RequireJS (anonymous module).
    define(['jquery', 'draggabilly/draggabilly'],
      (jQuery, Draggabilly) => factory(root, jQuery, Draggabilly));

  } else if (typeof module === 'object' && module.exports) {

    // NodeJS, Browserify, CommonJS-like, etc.
    let jQuery = root.jQuery || require('jquery');
    let Draggabilly = root.Draggabilly || require('draggabilly');
    module.exports = factory(root, jQuery, Draggabilly);

  } else { // Anything else.
    factory(root, jQuery, Draggabilly);
  }
  // -------------------------------------------------------------------------------------------------------------------
})( /* root = */ window, /* factory = */ (window, $, Draggabilly) => {
  'use strict';

  // Begin statics.

  let tabTemplate = `
    <div class="-tab">
      <div class="-background">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <symbol id="topleft" viewBox="0 0 214 29">
              <path d="M14.3 0.1L214 0.1 214 29 0 29C0 29 12.2 2.6 13.2 1.1 14.3-0.4 14.3 0.1 14.3 0.1Z" />
            </symbol>
            <symbol id="topright" viewBox="0 0 214 29">
              <use xlink:href="#topleft" />
            </symbol>
            <clipPath id="crop">
              <rect class="mask" width="100%" height="100%" x="0" />
            </clipPath>
          </defs>
          <svg width="50%" height="100%" transfrom="scale(-1, 1)">
            <use xlink:href="#topleft" width="214" height="29" class="-background" />
            <use xlink:href="#topleft" width="214" height="29" class="-shadow" />
          </svg>
          <g transform="scale(-1, 1)">
            <svg width="50%" height="100%" x="-100%" y="0">
              <use xlink:href="#topright" width="214" height="29" class="-background" />
              <use xlink:href="#topright" width="214" height="29" class="-shadow" />
            </svg>
          </g>
        </svg>
      </div>
      <div class="-favicon"></div>
      <div class="-title"></div>
      <div class="-close"></div>
    </div>
  `;
  let webViewTemplate = `
    <webview class="-view"></webview>
  `;
  let iframeViewTemplate = `
    <iframe class="-view" sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-orientation-lock allow-pointer-lock"></iframe>
  `; // Note the absence of `allow-top-navigation` in this list; i.e., do not allow frames to break the tabbed interface.
  // This attribute can be altered at runtime using `defaultProps.viewAttrs.sandbox`.

  let defaultTabTitle = 'New Tab';
  let defaultUnknownUrlTabTitle = 'Web Page';
  let defaultTabUrl = 'https://duckduckgo.com/?kae=b&kak=-1&kao=-1&k1=-1&kt=p&kj=f5f5f5&ka=p&kf=1&kam=google-maps&km=l&ko=1';
  let defaultTabFavicon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAANlBMVEUAAAD39/fR0dF0dHR0dHRaWlpzc3NaWlp0dHRZWVlZWVnz8/Py8vLp6elaWlrh4eFaWlp0dHSIJoqZAAAAEHRSTlMAAwW7tPTPxsXQq1JRIiIR6kG+xAAAAF1JREFUOMvtyjkOwCAMRFHbrNmH+182RZCQCA4NXfjNTPFoVCgt0gHw0gTP8g4gig6IgYTIDVDeZWH4CxCbLDRA4mFZAw4b05GKqEFAblXAGVwWNaia4N/gXR8M6gYwRQvBPew+AAAAAABJRU5ErkJggg==';
  let defaultLoadingTabFavicon = 'data:image/gif;base64,R0lGODlhEAAQAOMKAHNza4SEe5SMhJyclK2tnK2tpbW1rcbGvdbOxv8A/////////////////////////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgAPACwAAAAAEAAQAAAETfDJ+QihmJJi8zRGRQzFMwwYCD6ceaKfSr1wnJ3UcXiTIDw6w87j8+l0vOIPyXv4KAhEJhDAIA5RCpUKje4AgMe2Cv2Cw1zeOdycgD0RACH5BAUKAA8ALAAAAAAQABAAAARL8Mn5jKGYWpvnOdX2EAT2PSBHFCT1nRNZZDC1UgjSTcPw6LldrxfUdYa+4O7RowAAGYEA83xSpFJn9REIPLBTLbfrze7I3uWk24kAACH5BAUKAA8ALAAAAAAQABAAAARM8Mn5zqGY2ponQpV1GQb2HeD1kCT1fRRbul07AUA3EcSD4zpCgffLdXiPgs+oG1ICgcxggIFCKdPp0/oQCB5Z6rbr/Wp15a+O4u1EAAAh+QQFCgAPACwAAAAAEAAQAAAES/DJ+RCimF6bJwDV9hwH9n3hWJbeSZGkCWLsFATdZBjPfee7nQ/XCfJ+uceOIhBkCAVMs0mBPqKTqXMweECtzC23SyAkx93khNuJAAAh+QQFCgAPACwAAAAAEAAQAAAETPDJ+QCgmFqbZwjV9iAI9n3hiByld1IlaYKYPAlCNx3Hg+O6Hu+X6/B6vmIQKRkMMgYDxumkRKMU6pNAeFyl2S23i9URCg+0jnLuRAAAIfkEBQoADwAsAAAAABAAEAAABEzwyflCoJham6cQ1fYAAPZ94UiW3kmtbJuR1DB0E4I8to0jB13v1tE9dj7ccTchEDKHA4ZQcFKiD2mTKjEYslFts/DwerPKsjk9OWciACH5BAUKAA8ALAAAAAAQABAAAARK8Mn5hKCYWpvnGNX2BAH2feFIlt5JrWybkRRBdBMAPERh4zrdrwAMPnw4iY5iMGQQCEyzSYlCmdPH4fCARqXOrVby7WzFyQkaEwEAIfkEAQoADwAsAAAAABAAEAAABEzwyfnGoJhamych1fYIAkYUXziSpVc878S2E5qRlGF0UxA8Oh3P5wvuOsSfkPfwUQ6HDACAgT6ik+n0CY0iJFoq9/FFfLc885eJWWMiADs=';

  let totalInstances = -1; // Instance counter.

  // Begin `ChromeTabz{}` class.

  class ChromeTabz {
    get $tabz() {
      return this.$content.find('> .-tab');
    }

    get $currentTab() {
      return this.$tabz.filter('.-current');
    }

    get tabWidth() {
      let width = this.$content.innerWidth() - this.settings.overlapDistance;
      width = (width / this.$tabz.length) + this.settings.overlapDistance;
      return Math.max(this.settings.minWidth, Math.min(this.settings.maxWidth, width));
    }

    get effectiveTabWidth() {
      return this.tabWidth - this.settings.overlapDistance;
    }

    get tabPositions() {
      let positions = [],
        x = 0; // X axis positions.
      let effectiveWidth = this.effectiveTabWidth;

      this.$tabz.each((i, tab) => {
        positions.push(x);
        x += effectiveWidth;
      });
      return positions;
    }

    constructor(settings) {
      this.defaultSettings = {
        minWidth: 45,
        maxWidth: 243,
        rightMargin: 300,
        overlapDistance: 14,

        obj: '.chrome-tabz',
        viewz: 'iframes',
        // `iframes` or `webviews`.
        // `webviews` = Electron compatibility.
        // Or leave empty to disable viewz entirely.

        initialTabz: [], // Array of props.

        defaultProps: {
          url: defaultTabUrl,
          title: defaultTabTitle,
          favicon: defaultTabFavicon,

          loadingFavicon: defaultLoadingTabFavicon,
          unknownUrlTitle: defaultUnknownUrlTabTitle,

          viewAttrs: {} // Optional `<iframe>` or `<webview>` attrs.
          // These are simply `key: value` pairs representing HTML attrs.
        },
        debug: false, // Set as `false` in production please.
        // This setting enables console logging, for debugging.
      };
      this.settings = $.extend({}, this.defaultSettings, settings || {});

      this.$obj = $(this.settings.obj);
      this.$obj.data('chromeTabz', this);

      this.$bar = $('<div class="-bar"></div>');
      this.$content = $('<div class="-content"></div>');
      this.$bottomLine = $('<div class="-bottom-line"></div>');

      this.$viewz = $('<div class="-viewz"></div>');
      this.$styles = $('<style></style>');

      this.id = ++totalInstances; // Increment and assign an ID.
      this.draggabillyInstances = []; // Initialize instances.

      this.alwaysOnStyles = `.chrome-tabz.-id-${this.id} > .-bar > .-content {
        width: calc(100% - ${this.settings.rightMargin}px);
      }`;
      this.$obj.trigger('constructed', [this]);

      this.initialize(); // Initialize.
    }

    initialize() {
      this.addClasses();

      this.addBar();
      this.addContent();
      this.addBottomLine();
      this.addStyles();

      this.addViewz();
      this.addEvents();

      this.configureLayout();
      this.fixStackingOrder();
      this.addDraggabilly();

      if (this.settings.initialTabz) {
        this.addTabz(this.settings.initialTabz);
      }
      this.$obj.trigger('initialized', [this]);
    }

    destroy() {
      this.removeDraggabilly();
      this.$tabz.remove();

      this.removeEvents();
      this.removeViewz();

      this.removeStyles();
      this.removeBottomLine();
      this.removeContent();
      this.removeBar();

      this.removeClasses();

      this.$obj.removeData('chromeTabz');
      this.$obj.trigger('destroyed', [this]);
      this.$obj.off('.chrome-tabz');
    }

    addClasses() {
      this.$obj.addClass('chrome-tabz');
      this.$obj.addClass('-id-' + this.id);
    }

    removeClasses() {
      this.$obj.removeClass('chrome-tabz');
      this.$obj.removeClass('-id-' + this.id);
    }

    addBar() {
      this.$obj.append(this.$bar);
    }

    removeBar() {
      this.$bar.remove();
    }

    addContent() {
      this.$bar.append(this.$content);
    }

    removeContent() {
      this.$content.remove();
    }

    addBottomLine() {
      this.$bar.append(this.$bottomLine);
    }

    removeBottomLine() {
      this.$bottomLine.remove();
    }

    addStyles() {
      this.$bar.append(this.$styles);
      this.$styles.html(this.alwaysOnStyles);
    }

    removeStyles() {
      this.$styles.remove();
    }

    addViewz() {
      if (!this.settings.viewz) {
        return; // Not applicable.
      }
      this.$obj.append(this.$viewz);

      new ChromeTabViewz($.extend({}, {
        parentObj: this.$obj,
        type: this.settings.viewz,
        defaultProps: this.settings.defaultProps
      }));
    }

    removeViewz() {
      if (this.settings.viewz) {
        this.$viewz.data('chromeTabViewz').destroy();
        this.$viewz.remove();
      }
    }

    addEvents() {
      $(window).on('resize.chrome-tabz.id-' + this.id, (e) => this.configureLayout());
      this.$obj.on('dblclick.chrome-tabz', (e) => this.addTab());
      this.$obj.on('click.chrome-tabz', (e) => {
        let $target = $(e.target);

        if ($target.hasClass('-tab')) {
          this.setCurrentTab($target);
        } else if ($target.hasClass('-favicon')) {
          this.setCurrentTab($target.parent('.-tab'));
        } else if ($target.hasClass('-title')) {
          this.setCurrentTab($target.parent('.-tab'));
        } else if ($target.hasClass('-close')) {
          this.removeTab($target.parent('.-tab'));
        }
      });
    }

    removeEvents() {
      $(window).off('.chrome-tabz.id-' + this.id);
      this.$obj.off('.chrome-tabz');
    }

    configureLayout() {
      this.$tabz.width(this.tabWidth);
      this.$tabz.removeClass('-just-dragged');
      this.$tabz.removeClass('-currently-dragged');

      requestAnimationFrame(() => {
        let styles = ''; // Initialize.

        $.each(this.tabPositions, (i, x) => {
          styles += `.chrome-tabz.-id-${this.id} > .-bar > .-content > .-tab:nth-child(${i + 1}) {
            transform: translate3d(${x}px, 0, 0);
          }`;
        }); // This adds an X offset layout for all tabz.
        this.$styles.html(this.alwaysOnStyles + styles); // Set styles.
      });
    }

    fixStackingOrder() {
      let totalTabz = this.$tabz.length;

      this.$tabz.each((i, tab) => {
        let $tab = $(tab);
        let zindex = totalTabz - i;

        if ($tab.hasClass('-current')) {
          zindex = totalTabz + 2;
          this.$bottomLine.css({ zindex: totalTabz + 1 });
        }
        $tab.css({ zindex: zindex });
      });
    }

    addDraggabilly() {
      this.removeDraggabilly();

      this.$tabz.each((i, tab) => {

        let $tab = $(tab); // Current tab.
        let originalX = this.tabPositions[i];

        let draggabilly = new Draggabilly($tab[0], { axis: 'x', containment: this.$content });
        this.draggabillyInstances.push(draggabilly); // Maintain instances.

        draggabilly.on('dragStart', () => {
          this.$tabz.removeClass('-just-dragged');
          this.$tabz.removeClass('-currently-dragged');

          this.fixStackingOrder();

          this.$bar.addClass('-dragging');
          $tab.addClass('-currently-dragged');
          this.$obj.trigger('tabDragStarted', [$tab]);
        });
        draggabilly.on('dragMove', (event, pointer, moveVector) => {
          let $tabz = this.$tabz;
          let prevIndex = $tab.index();
          let ew = this.effectiveTabWidth;
          let prevX = originalX + moveVector.x;

          let newIndex = Math.floor((prevX + (ew / 2)) / ew);
          newIndex = Math.max(0, Math.min(Math.max(0, $tabz.length - 1), newIndex));

          if (prevIndex !== newIndex) {
            $tab[newIndex < prevIndex ? 'insertBefore' : 'insertAfter']($tabz.eq(newIndex));
            this.$obj.trigger('tabDragMoved', [$tab, { prevIndex, newIndex }]);
          }
        });
        draggabilly.on('dragEnd', () => {
          let finalX = parseFloat($tab.css('left'), 10);
          $tab.css({ transform: 'translate3d(0, 0, 0)' });

          requestAnimationFrame(() => {
            $tab.css({ left: 0, transform: 'translate3d(' + finalX + 'px, 0, 0)' });

            requestAnimationFrame(() => {
              $tab.addClass('-just-dragged');
              $tab.removeClass('-currently-dragged');
              setTimeout(() => $tab.removeClass('-just-dragged'), 500);

              this.setCurrentTab($tab);

              requestAnimationFrame(() => {
                this.addDraggabilly();
                $tab.css({ transform: '' });

                this.$bar.removeClass('-dragging');
                this.$obj.trigger('tabDragStopped', [$tab]);
              });
            });
          });
        });
      });
    }

    removeDraggabilly() {
      $.each(this.draggabillyInstances, (i, instance) => instance.destroy());
      this.draggabillyInstances = []; // Reset instance array.
    }

    addTab(props) {
      return this.addTabz([props]).eq(0);
    }

    addTabz(propSets) {
      let $tabz = $(); // Initialize.

      $.each(propSets, (i, props) => {
        let $tab = $(tabTemplate);
        this.$content.append($tab);

        $tab.addClass('-just-added');
        setTimeout(() => $tab.removeClass('-just-added'), 500);

        this.$obj.trigger('tabAdded', [$tab]);

        this.updateTab($tab, props);

        $tabz = $tabz.add($tab);
      });
      if ($tabz.length) {
        this.setCurrentTab($tabz.eq(0));
        this.configureLayout();
        this.fixStackingOrder();
        this.addDraggabilly();
      }
      return $tabz;
    }

    removeTab($tab) {
      if (!$tab || !$tab.length) {
        throw 'Missing $tab.';
      }
      if ($tab.hasClass('-current')) {
        if ($tab.prev('.-tab').length) {
          this.setCurrentTab($tab.prev('.-tab'));
        } else if ($tab.next('.-tab').length) {
          this.setCurrentTab($tab.next('.-tab'));
        } else {
          this.setCurrentTab(undefined);
        }
      }
      this.$obj.trigger('tabBeingRemoved', [$tab]);

      $tab.remove(); // Now remove the tab.

      this.$obj.trigger('tabRemoved', [$tab]);

      this.configureLayout();
      this.fixStackingOrder();
      this.addDraggabilly();
    }

    updateTab($tab, props, via) {
      if (!$tab || !$tab.length) {
        throw 'Missing $tab.';
      }
      let existingProps = $tab.data('props');
      props = $.extend({}, this.settings.defaultProps, existingProps || {}, props || {});
      $tab.data('props', props); // Update to new props.

      $tab.find('.-title').text(props.title);

      if (props.favicon) {
        $tab.find('.-favicon').css({ 'background-image': 'url(\'' + props.favicon + '\')' });
      } else { $tab.find('.-favicon').css({ 'background-image': 'none' }); }

      this.$obj.trigger('tabUpdated', [$tab, props, via]);
    }

    setCurrentTab($tab) {
      this.$tabz.removeClass('-current');

      if ($tab && $tab.length) {
        $tab.addClass('-current');
        this.fixStackingOrder();
      }
      this.$obj.trigger('currentTabChanged', [$tab || $()]);
    }
  } // End `ChromeTabz{}` class.

  // Begin `ChromeTabViewz{}` class.

  class ChromeTabViewz {
    get $viewz() {
      return this.$content.find('> .-view');
    }

    get $currentView() {
      return this.$viewz.filter('.-current');
    }

    constructor(settings) {
      this.defaultSettings = {
        parentObj: '.chrome-tabz',
        type: 'iframes', // or `webviews`.
        // `webviews` = Electron compatibility.

        defaultProps: {
          url: defaultTabUrl,
          title: defaultTabTitle,
          favicon: defaultTabFavicon,

          loadingFavicon: defaultLoadingTabFavicon,
          unknownUrlTitle: defaultUnknownUrlTabTitle,

          viewAttrs: {} // Optional `<iframe>` or `<webview>` attrs.
          // These are simply `key: value` pairs representing HTML attrs.
        },
        debug: false, // Set as `false` in production please.
        // This setting enables console logging, for debugging.
      };
      this.settings = $.extend({}, this.defaultSettings, settings || {});

      if ($.inArray(this.settings.type, ['iframes', 'webviews']) === -1)
        this.settings.type = this.defaultSettings.type;

      this.$parentObj = $(this.settings.parentObj);
      this.$parentObj._ = this.$parentObj.data('chromeTabz');

      this.$obj = this.$parentObj.find('> .-viewz');
      this.$obj.data('chromeTabViewz', this);

      this.viewIndex = []; // Initialize index array.
      this.$content = $('<div class="-content"></div>');

      this.$obj.trigger('constructed', [this]);

      this.initialize(); // Initialize.
    }

    initialize() {
      this.addContent();
      this.addEvents();

      this.$obj.trigger('initialized', [this]);
    }

    destroy() {
      this.$viewz.remove();

      this.removeEvents();
      this.removeContent();

      this.$obj.removeData('chromeTabViewz');
      this.$obj.trigger('destroyed', [this]);
      this.$obj.off('.chrome-tabz');
    }

    addContent() {
      this.$obj.append(this.$content);
    }

    removeContent() {
      this.$content.remove();
    }

    addEvents() {
      this.$parentObj.on('tabAdded.chrome-tabz', (e, $tab) => this.addView($tab));
      this.$parentObj.on('tabBeingRemoved.chrome-tabz', (e, $tab) => this.removeView(undefined, $tab));

      this.$parentObj.on('tabDragMoved.chrome-tabz', (e, $tab, locations) => this.setViewIndex(undefined, locations.prevIndex, locations.newIndex));
      this.$parentObj.on('tabUpdated.chrome-tabz', (e, $tab, props, via) => this.updateView(undefined, $tab, props, via));
      this.$parentObj.on('currentTabChanged.chrome-tabz', (e, $tab) => this.setCurrentView(undefined, $tab));
    }

    removeEvents() {
      this.$parentObj.off('.chrome-tabz');
    }

    addView($tab) {
      if (!$tab || !$tab.length) {
        throw 'Missing $tab.';
      }
      let $view; // Initialize.

      if (this.settings.type === 'webviews') {
        $view = $(webViewTemplate);
      } else { // Default type.
        $view = $(iframeViewTemplate);
      }
      $view.data('urlCounter', 0); // Initialize.
      this.$content.append($view); // Add to DOM.

      this.setViewIndex($view, undefined, $tab.index());

      this.$obj.trigger('viewAdded', [$view]);

      return $view;
    }

    removeView($view, $tab) {
      if ((!$view || !$view.length) && $tab && $tab.length) {
        $view = this.viewAtIndex($tab.index(), true);
      }
      if (!$view || !$view.length) {
        throw 'Missing $view.';
      }
      this.$obj.trigger('viewBeingRemoved', [$view]);

      this.removeViewFromIndex($view);
      $view.remove(); // Now remove the view.

      this.$obj.trigger('viewRemoved', [$view]);
    }

    removeViewFromIndex($view) {
      if (!$view || !$view.length) {
        throw 'Missing $view.';
      }
      this.viewIndex.splice(this.mapViewIndex($view, true), 1);
    }

    viewAtIndex(index, require) {
      if (typeof index !== 'number') {
        throw 'Invalid index.';
      }
      let $view = this.viewIndex[index] || undefined;

      if (require && (!$view || !$view.length)) {
        throw 'No $view with that index.';
      }
      return $view; // Otherwise return.
    }

    mapViewIndex($view, require) {
      if (!$view || !$view.length) {
        throw 'Missing $view.';
      }
      for (let index = 0; index < this.viewIndex.length; index++) {
        if (this.viewIndex[index].is($view)) return index;
      } // This uses jQuery `.is()` to compare.

      if (require) { // Require?
        throw '$view not in the index.';
      }
      return -1; // Default return value.
    }

    setViewIndex($view, prevIndex, newIndex) {
      if ((!$view || !$view.length) && prevIndex !== undefined) {
        if (typeof prevIndex !== 'number') {
          throw 'prevIndex is not a number.';
        } else if (isNaN(prevIndex) || prevIndex < 0) {
          throw 'prevIndex is an invalid number.';
        } // This is important to get right!
        $view = this.viewAtIndex(prevIndex, true);
      }
      if (!$view || !$view.length) {
        throw 'Missing $view.';
      } else if (typeof newIndex !== 'number') {
        throw 'newIndex is not a number.';
      } else if (isNaN(newIndex) || newIndex < 0) {
        throw 'newIndex is an invalid number.';
      }
      if ((prevIndex = this.mapViewIndex($view)) !== -1) {
        this.viewIndex.splice(prevIndex, 1);
      } // Remove from current index (if applicable).
      this.viewIndex.splice(newIndex, 0, $view); // New index.

      this.$obj.trigger('viewIndexed', [$view, { prevIndex, newIndex }]);
    }

    updateView($view, $tab, props, via) {
      if (via === 'view::state-change') {
        return; // Ignore this quietly.
      } // See state-change events below.

      if ((!$view || !$view.length) && $tab && $tab.length) {
        $view = this.viewAtIndex($tab.index(), true);
      }
      if (!$view || !$view.length) {
        throw 'Unable to update. Missing $view.';
      }
      let existingProps = $view.data('props'); // Existing props.
      props = $.extend({}, this.settings.defaultProps, existingProps || {}, props || {});
      $view.data('props', props); // Update to new props after merging.

      $.each(props.viewAttrs, (key, value) => {
        if (key.toLowerCase() !== 'src') $view.attr(key, value);
      }); // Anything but `src`, which is handled below.

      if (!existingProps || existingProps.url !== props.url) {
        let isFirstUrl = () => { // The first URL?
          return Number($view.data('urlCounter')) === 1;
        }; // True if the first URL, based on counter.

        let $getTab = (require = true) => { // Tab matching view.
          let $tab = this.$parentObj._.$tabz.eq(this.mapViewIndex($view, require));
          if (require && (!$tab || !$tab.length)) throw 'Missing $tab.';
          return $tab; // Otherwise, return the tab now.
        }; // Gets tab dynamically in case it was moved by a user.

        if (this.settings.type === 'webviews') {
          let _favicon = ''; // Held below until loading is complete.
          let webContents = $view[0].getWebContents(); // <http://jas.xyz/2hjaozy>

          webContents.removeAllListeners('did-start-loading'),
            webContents.addListener('did-start-loading', (e) => {
              let $tab = $getTab(),
                props = $view.data('props');

              // Increment the `<webview>` URL counter.
              $view.data('urlCounter', $view.data('urlCounter') + 1);

              // Use fallbacks on failure.
              let favicon = props.loadingFavicon;
              let title = webContents.getURL() || '';
              title = !title && isFirstUrl() ? props.title : title;
              title = !title ? /* Loading dots. */ '...' : title;

              // Update the tab favicon and title.
              this.$parentObj._.updateTab($tab, { favicon, title }, 'view::state-change');

              // Trigger event after updating tab.
              this.$obj.trigger('viewStartedLoading', [$view]);
            });

          webContents.removeAllListeners('did-stop-loading'),
            webContents.addListener('did-stop-loading', (e) => {
              let $tab = $getTab(),
                props = $view.data('props');

              // In the case of failure, use fallbacks.
              let favicon = !_favicon && isFirstUrl() ? props.favicon : _favicon;
              favicon = !favicon ? this.settings.defaultProps.favicon : favicon;

              // Updating tab favicon.
              this.$parentObj._.updateTab($tab, { favicon }, 'view::state-change');

              // Trigger event after updating tab.
              this.$obj.trigger('viewStoppedLoading', [$view]);
            });

          webContents.removeAllListeners('page-favicon-updated'),
            webContents.addListener('page-favicon-updated', (e) => {
              let $tab = $getTab(),
                props = $view.data('props');

              // In the case of failure, use fallbacks.
              _favicon = e.favicons.length ? e.favicons[0] : '';
              let favicon = !_favicon && isFirstUrl() ? props.favicon : _favicon;
              favicon = !favicon ? this.settings.defaultProps.favicon : favicon;

              // If not loading, go ahead and update the favicon.
              if (!webContents.isLoading()) { // Update; done loading.
                this.$parentObj._.updateTab($tab, { favicon }, 'view::state-change');
              }
              // Trigger event after updating tab.
              this.$obj.trigger('viewFaviconUpdated', [$view, favicon]);
            });

          webContents.removeAllListeners('page-title-updated'),
            webContents.addListener('page-title-updated', (e) => {
              let $tab = $getTab(),
                props = $view.data('props');

              // In the case of failure, use fallbacks.
              let title = webContents.getTitle() || '';
              title = !title ? webContents.getURL() : title;
              title = !title ? this.settings.defaultProps.unknownUrlTitle : title;

              // Title can be updated immediately.
              if (webContents.isLoading() !== 'nil') {
                this.$parentObj._.updateTab($tab, { title }, 'view::state-change');
              }
              // Trigger event after updating tab.
              this.$obj.trigger('viewTitleUpdated', [$view, title]);
            });

          webContents.loadURL(props.url); // Begin loading.

        } else { // Handle as `<iframe>` (more difficult to work with).
          let $contentWindow = $($view[0].contentWindow); // jQuery wrapper.
          let onUnloadHandler; // Referenced again below when reattaching.

          let tryGettingSameDomainUrl = () => {
            try { // Same-domain iframes only.
              return $view.contents().prop('URL');
            } catch (exception) {} // Fail gracefully.
          };
          let tryGettingSameDomainFavicon = () => {
            try { // Same-domain iframes only.
              return $.trim($view.contents().find('head > link[rel="shortcut icon"]').prop('href'));
            } catch (exception) {} // Fail gracefully.
          };
          let tryGettingSameDomainTitle = () => {
            try { // Same-domain iframes only.
              return $.trim($view.contents().find('head > title').text());
            } catch (exception) {} // Fail gracefully.
          };
          let tryReattachingSameDomainUnloadHandler = () => {
            try { // Same-domain iframes only.
              $contentWindow.off('unload.chrome-tabz').on('unload.chrome-tabz', onUnloadHandler);
            } catch (exception) {} // Fail gracefully.
          };

          $contentWindow.off('unload.chrome-tabz')
            .on('unload.chrome-tabz', (onUnloadHandler = (e) => {
              let $tab = $getTab(false),
                props = $view.data('props');

              if (!$tab || !$tab.length || !$.contains(document, $tab[0])) {
                return; // e.g., The tab was removed entirely.
              } // i.e., Unloading occurs on tab removals also.

              if (!props || !$.contains(document, $view[0])) {
                return; // e.g., View was removed entirely.
              } // i.e., Unloading occurs on tab removals also.

              // Increment the `<iframe>` URL counter.
              $view.data('urlCounter', $view.data('urlCounter') + 1);

              // Use fallbacks on failure.
              let favicon = props.loadingFavicon;
              let title = isFirstUrl() ? props.url : '';
              title = !title && isFirstUrl() ? props.title : title;
              title = !title ? /* Loading dots. */ '...' : title;

              // Update the tab favicon and title. Unloaded = now loading.
              this.$parentObj._.updateTab($tab, { favicon, title }, 'view::state-change');

              // Trigger event after updating tab.
              this.$obj.trigger('viewStartedLoading', [$view]);
            }));

          $view.off('load.chrome-tabz').on('load.chrome-tabz', (e) => {
            let $tab = $getTab(),
              props = $view.data('props');

            // Reattach `unload` event handler.
            tryReattachingSameDomainUnloadHandler();

            // In the case of failure, use fallbacks.
            let url = tryGettingSameDomainUrl() || '';
            url = !url && isFirstUrl() ? props.url : url;

            // In the case of failure, use fallbacks.
            let favicon = tryGettingSameDomainFavicon() || '';
            favicon = !favicon && isFirstUrl() ? props.favicon : favicon;
            favicon = !favicon && url ? url.replace(/^(https?:\/\/[^\/]+).*$/i, '$1') + '/favicon.ico' : favicon;
            favicon = !favicon ? this.settings.defaultProps.favicon : favicon;

            // In the case of failure, use fallbacks.
            let title = tryGettingSameDomainTitle() || '';
            title = !title && isFirstUrl() ? props.title : title;
            title = !title ? url : title; // Prefer URL over unknown title.
            title = !title ? this.settings.defaultProps.unknownUrlTitle : title;

            // Update the favicon and title.
            this.$parentObj._.updateTab($tab, { favicon, title }, 'view::state-change');

            // Trigger these events for iframes too.
            this.$obj.trigger('viewFaviconUpdated', [$view, favicon]);
            this.$obj.trigger('viewTitleUpdated', [$view, title]);

            // Trigger event after updating tab.
            this.$obj.trigger('viewStoppedLoading', [$view]);
          });

          $view.attr('src', props.url); // Begin loading.
        }
      }
      this.$obj.trigger('viewUpdated', [$view, props, via]);
    }

    setCurrentView($view, $tab) {
      if ((!$view || !$view.length) && $tab && $tab.length) {
        $view = this.viewAtIndex($tab.index(), false);
      }
      this.$viewz.removeClass('-current');

      if ($view && $view.length) {
        $view.addClass('-current');
      }
      this.$obj.trigger('currentViewChanged', [$view || $()]);
    }
  } // End `ChromeTabViewz{}` class.

  // Begin jQuery extension as a wrapper for both classes.

  $.fn.chromeTabz = function (settings) {
    return this.each((i, obj) => {
      if (!$(obj).data('chromeTabz')) {
        new ChromeTabz($.extend({}, settings || {}, { obj }));
      }
    });
  };
  // Handle factory return value.

  return $.fn.chromeTabz; // Extension reference.
});

},{"draggabilly":1,"jquery":undefined}]},{},[6]);