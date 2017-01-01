## Chrome Tabz

<img src="https://media.githubusercontent.com/media/jaswsinc/chrome-tabz/dev/assets/images/electron-icon.png" width="128" align="right" />
<img src="https://media.githubusercontent.com/media/jaswsinc/chrome-tabz/dev/assets/images/chrome-icon.png" width="64" align="right" />

[Electron](http://electron.atom.io/) tabs and/or browser compatible HTML/CSS and JS chrome tabs, with a jQuery wrapper. Perfect for Electron Webviews and/or IFrames.

_~ Inspired by and based on the original [Chrome Tabs](https://github.com/adamschwartz/chrome-tabs) by [@adamschwartz](https://github.com/adamschwartz)._

This is an ES6 project for Electron [`<webview>`](http://electron.atom.io/docs/api/web-view-tag/) tags. However, it also supports [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) tags in modern web browsers that support ES5+. _Note: `dists/js/bundle.min.js` is transpiled into traditional JS for web browser compatibility. Tested in Chrome, Firefox, and Safari._

![Demo](https://jaswsinc.github.io/chrome-tabz/demos/images/demo.gif)

### Features

- Supports Electron Webviews.
- Looks and feels like Google Chrome tabs.
- Supports default and/or custom tab titles.
- Supports default and/or custom tab favicons.
- Supports drag n' drop tab arrangement like Chrome.
- Supports `<webview>` and/or `<iframe>` (web browser) view types.
- Supports automatic favicons/titles in `<webview>` and/or `<iframe>` views.
- Supports navigation events; i.e., changes in location, title, favicon (like a browser).
- Can also run as _just_ tabs — i.e., bring your own content views.
- Supports easy access via jQuery and triggers several events.

### Live Demos

_**Tip:** In these demos you can 'View Page Source' for additional insight._

- [Same-Domain IFrames](https://jaswsinc.github.io/chrome-tabz/demos/viewz/iframes-same-domain/index.html)
- [Search Engine IFrames](https://jaswsinc.github.io/chrome-tabz/demos/viewz/iframes-search-engines/index.html)
- [IFrames w/ Examples in Source](https://jaswsinc.github.io/chrome-tabz/demos/viewz/iframes-elaborate/index.html)

---

### Available Installation Options

You can simply [**download a ZIP file**](https://github.com/jaswsinc/chrome-tabz/archive/master.zip) containing the contents of this repository. Or, you can install the [**NPM module**](https://www.npmjs.com/package/chrome-tabz) for NodeJS/Electron applications. There is also a [**Composer package**](https://packagist.org/packages/jaswsinc/chrome-tabz) available.

#### Installing Node Module

```
$ npm install --save chrome-tabz
```

#### Installing Composer Package

```
$ composer require jaswsinc/chrome-tabz
```

---

### [Electron](http://electron.atom.io/) Tabbed Interface Implementation

<img src="https://media.githubusercontent.com/media/jaswsinc/chrome-tabz/dev/assets/images/electron-icon.png" width="128" align="right" />

ChromeTabz requires a `window.document` object. Generally speaking, most NodeJS projects do not incorporate a web browser. However, there are some exceptions, and Electron apps are one of those. **ChromeTabz works great as a tabbed interface for Electron apps!**

#### Suggested CSS/Styles

This goes in your `.html` document (the Electron Renderer Process).

```html
<style>
  html,
  body {
    margin:                     0;
    padding:                    0;
    overflow:                   hidden;
    background-color:           #e6e6e6;
  }
</style>
```

#### Required CSS/Styles

This goes in your `.html` document (the Electron Renderer Process).

```html
<link rel="stylesheet" href="node_modules/chrome-tabz/src/css/base.min.css" />
<link rel="stylesheet" href="node_modules/chrome-tabz/src/css/dark.min.css" />
<!-- Actually, the dark theme is optional. If not using, feel free to exclude. -->
```

#### Required HTML Markup

Again, this goes in your `.html` document (the Electron Renderer Process).

```html
<div class="chrome-tabz"></div>
```

Or, if you want the dark theme, add the `-dark-theme` class.

```html
<div class="chrome-tabz -dark-theme"></div>
```

#### Required JavaScript Snippet

Again, this goes in the Electron Renderer Process.

_**Note:** Any version of jQuery >= v2.2.4 will do fine._

```html
<script>
  let $ = require('jquery');
  $.fn.chromeTabz = require('chrome-tabz');

  $(document).ready(() => {
    $('.chrome-tabz').chromeTabz({viewz: 'webviews'});
  });
</script>
```

---

### Web Browser Implementation (i.e., Outside of Electron)

<img src="https://media.githubusercontent.com/media/jaswsinc/chrome-tabz/dev/assets/images/chrome-icon.png" width="128" align="right" />

#### Suggested CSS/Styles

```html
<style>
  html,
  body {
    margin:                     0;
    padding:                    0;
    overflow:                   hidden;
    background-color:           #e6e6e6;
  }
</style>
```

#### Required CSS/Styles

```html
<link rel="stylesheet" href="src/css/base.min.css" />
<link rel="stylesheet" href="src/css/dark.min.css" />
<!-- Actually, the dark theme is optional. If not using, feel free to exclude. -->
```

#### Required JavaScript Files

_**Note:** Any version of jQuery >= v2.2.4 will do fine._

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script src="dists/js/bundle.min.js"></script>
```

#### Required HTML Markup

```html
<div class="chrome-tabz"></div>
```

Or, if you want the dark theme, add the `-dark-theme` class.

```html
<div class="chrome-tabz -dark-theme"></div>
```

#### Required JavaScript Snippet

```html
<script>
  jQuery(document).ready(function($) {
    $('.chrome-tabz').chromeTabz();
  });
</script>
```

---

### jQuery Configuration Options (Browser or Electron)

_**Note:** This example represents the default option values._

```js
$('.chrome-tabz').chromeTabz({
  minWidth: 45,
  maxWidth: 243,
  leftMargin: 0,
  rightMargin: 300,
  overlapDistance: 14,

  viewz: 'iframes',
  // `iframes` or `webviews`.
  // `webviews` = Electron compatibility.
  // Or leave empty to disable viewz entirely.

  allowDragNDrop: true,
  allowDoubleClick: true,
  initial: [], // Initial tabz.
  // This is an array of prop objs.

  defaultProps: {
    title: 'New Tab',
    favicon: 'default',
    url: 'https://duckduckgo.com/?kae=b&kak=-1&kao=-1&k1=-1&kt=p&kj=f5f5f5&ka=p&kf=1&kam=google-maps&km=l&ko=1',

    unknownUrlTitle: 'Web Page',
    loadingFavicon: 'loading',

    allowClose: true,

    viewAttrs: {}
  },
});
```

### jQuery Config Option Documentation

- `minWidth: 45` The minimum width of each tab, in pixels. When new tabs are added, or when a window is resized, the width of each tab changes automatically. This setting controls the absolute minimum width allowed for each tab.

- `maxWidth: 243` The maximum width of each tab, in pixels. When old tabs are removed, or when a window is resized, the width of each tab changes automatically. This setting controls the absolute maximum width allowed for each tab.

- `leftMargin: 0` Margin on the left-hand side of the entire tab group, in pixels. The default value is `0`. In Electron apps you might want to use `leftMargin: 60` to allow room for window minimize/maximize controls in inset window frames on macOS. It just depends on how you setup your Electron app.

- `rightMargin: 300` Margin on the right-hand side of the entire tab group, in pixels. The default value gives you room to add your own custom UI elements that sit inside the tabbed interface, and your custom UI elements will have `300` pixels of space that they can consume; i.e., without being covered up by a long list of tabs created by an end-user.

- `overlapDistance: 14` This is the amount of tab overlap, in pixels. Each tab overlaps the previous tab by this number of pixels in order to mimic Google Chrome's interface design.

- `viewz: 'iframes'` This controls the underlying Chrome Tab Viewz class. In short, 'Viewz' make 'Tabz' function like they would in a typical web browser. When Viewz are enabled, a tab is associated with a `url:` property.

  - `'iframes'` If you set this to `iframes`, when a tab is selected, the `url:` tab property is loaded automatically in an [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe). This makes Chrome Tabz compatible with regular web browsers.

  - `'webviews'` In Electron, you can set this to `webviews`. When a tab is selected, the `url:` tab property is loaded in a [`<webview>`](http://electron.atom.io/docs/api/web-view-tag/) tag automatically. The `<webview>` tag only works in Electron apps.

  - `''` If you set this to an empty string, all you get are the tabs; i.e., you can attach your own event handlers that load whatever content is associated with a given tab; e.g., via AJAX, custom iframes, etc.

- `allowDragNDrop: true` By default, tabs can be arranged by dragging them around and dropping them into a desired location. If you'd like to disable this functionality, set this option to `false`; i.e., `false` = do not allow the end-user to arrange tabs.

- `allowDoubleClick: true` By default, double-clicking the tabbed interface will add a new default tab. If you'd like to disable this functionality, set this option to `false`; i.e., `false` = do not allow the end-user to create new tabs on their own.

- `initial: []` When you want to begin with a specific set of tabs, this option comes in handy, as a convenience. Add a set of [Tab Properties](#tab-properties-documentation) for each tab that you want to initialize. Any [Tab Properties](#tab-properties-documentation) that you don't set, for any given tab, will automatically inherit from the list of `defaultProps: {}`, which is also a configurable option.

  _**Warning:** Don't use this option if you're attaching custom event handlers. Why? If you do, any 'initial' tabs will not trigger your custom event handlers as expected. Simply because 'initial' tabs are initialized together as the class is being constructed; i.e., before you've had the chance to attach your custom event handlers. Therefore, the best practice, if you're attaching custom event handlers, is to use the [`addTabz()`](#addtabz-method) method instead — right **after** your custom event handlers have been attached. That way your initial tabs will also trigger your custom event handlers._

  ```js
  initial: [
    {}, // i.e., Default tab w/ no overriding properties.

    { url: '1.html' },
    { url: '2.html' },
    { url: '3.html' },
    { url: '4.html' },
    { url: '5.html' },
    { url: '6.html' },
    { url: '7.html' },
    { url: '8.html' },
    { url: '9.html' },

    {
      title: 'New Tab',
      favicon: 'src/images/default-favicon.svg',
      url: 'https://duckduckgo.com/?kae=b&kak=-1&kao=-1&k1=-1&kt=p&kj=f5f5f5&ka=p&kf=1&kam=google-maps&km=l&ko=1',
    }
  ]
  ```

- `defaultProps: {}` This is a set of default [Tab Properties](#tab-properties-documentation) that each new tab will inherit from. By configuring default properties, you establish traits that every new tab will have by default, and then you can override these defaults when new tabs are being added. In short, this saves you from repeating yourself. This also establishes what a new tab will look like whenever a user double-clicks the tabbed interface.

  ```js
  defaultProps: {
    title: 'New Tab',
    favicon: 'src/images/default-favicon.svg',
    url: 'https://duckduckgo.com/?kae=b&kak=-1&kao=-1&k1=-1&kt=p&kj=f5f5f5&ka=p&kf=1&kam=google-maps&km=l&ko=1',

    unknownUrlTitle: 'Web Page',
    loadingFavicon: 'src/images/loading-favicon.gif',

    allowClose: true,

    viewAttrs: {}
  }
  ```

  _**Notable Exception:** When a tab is given a `url:` property, its `favicon:` and `title:` properties do not inherit from any defaults. Even setting the `title:` or `favicon:` properties explicitly will have little impact. Instead, the favicon & title are automatically derived from the URL itself, as one would expect from any web browser._

    _On the other hand, if you're using `viewz: 'iframes'`, and you attempt to add a tab with a URL that is not on the same domain as your tabbed interface, browser security restrictions do not allow for automatic detection. In such a case, explicit `favicon:` and `title:` properties must be set for each tab. Note also, this does not apply to Electron `<webview>` tags, which are not subjected to the same cross-domain limitations as `<iframe>` tags._


---

### Tab Properties Documentation

```js
title: 'New Tab',
favicon: 'src/images/default-favicon.svg',
url: 'https://duckduckgo.com/?kae=b&kak=-1&kao=-1&k1=-1&kt=p&kj=f5f5f5&ka=p&kf=1&kam=google-maps&km=l&ko=1',

unknownUrlTitle: 'Web Page',
loadingFavicon: 'src/images/loading-favicon.gif',

allowClose: true,

viewAttrs: {}
```

- `title: ''` Establishes the default title for a tab.

- `favicon: 'default'` Establishes the favicon for a tab. This can be the special string: `default` (built-in default tab icon), a `data:` URI, a relative image path (svg,png,gif,ico), or a full URL leading to an image. The built-in default value (`default`) works well in both the light & dark themes; i.e., just as a default tab favicon.

- `url: ''` This establishes the content for the tab 'view'; i.e., the location of the content that should be displayed whenever the tab is active.

  _**Special Note:** When a tab is given a `url:` property, its `favicon:` and `title:` properties do not inherit from any defaults. Even setting the `title:` or `favicon:` properties explicitly will have little impact. Instead, the favicon & title are automatically derived from the URL itself, as one would expect from any web browser._

    _On the other hand, if you're using `viewz: 'iframes'`, and you attempt to add a tab with a URL that is not on the same domain as your tabbed interface, browser security restrictions do not allow for automatic detection. In such a case, explicit `favicon:` and `title:` properties must be set for each tab. Note also, this does not apply to Electron `<webview>` tags, which are not subjected to the same cross-domain limitations as `<iframe>` tags._

- `unknownUrlTitle: ''` In the case of URL loading failure, or when cross-domain restrictions prohibit automatic title detection (based on URL), this default title will be displayed instead.

- `loadingFavicon: 'loading'` Establishes the loading favicon. This can be the special string: `loading` (built-in loading icon), a `data:` URI, a relative image path (svg,png,gif,ico), or a full URL leading to an image. The built-in default value (`loading`) is recommended, which helps to convey that a tab is loading in both the light & dark themes.

- `allowClose: true` Should an end-user be allowed to close the tab? If `false`, the close icon will not be shown, making it impossible to close the tab.

- `viewAttrs: {}` A 'view' is the underlying `<iframe>` or `<webview>` tag. If you'd like to set HTML attributes on the auto-generated view for any given tab, you can use this property to do that. These are simply `key: value` pairs representing HTML attrs. Here is an example of some attributes supported by the [`<webview>`](http://electron.atom.io/docs/api/web-view-tag/) tag in Electron apps.

  ```js
  viewAttrs: {
    preload: './my.js',
    allowpopups: null,
    disablewebsecurity: null,
    webpreferences: 'allowDisplayingInsecureContent'
    // ... and some others are also available.
    // See: <http://electron.atom.io/docs/api/web-view-tag/>
  }
  ```

---

### `ChromeTabz` Class Property Documentation

#### Underlying Class Instance via jQuery

The class instance can be obtained via jQuery.
Point `$chromeTabz._` to the underlying class instance.

```js
// References we'll work with below.
var $chromeTabz = $('.chrome-tabz').chromeTabz(); // w/ jQuery wrapper.
$chromeTabz._ = $chromeTabz.data('chromeTabz'); // ChromeTabz class instance.
```

---

#### `$tabz` Property (Read-Only)

_jQuery_: A jQuery object representing the current set of tabz.

_**Note:** Tab elements are indexed by jQuery and their index will always reflect the location of each tab as it appears in the UI. Remember that jQuery uses a zero-based index system. So the first tab (as seen in the UI) would be at index position `0`._

```js
var $tabz = $chromeTabz._.$tabz; // All tabz.
var $firstTab = $tabz.eq(0); // First tab w/ jQuery wrapper.
var firstTab = $tabz[0]; // DOM element w/o jQuery wrapper.
```

---

#### `$currentTab` Property (Read-Only)

_jQuery_: A jQuery object representing the current/active tab.


```js
var $tab = $chromeTabz._.$currentTab;
```

To find a tab's current index (i.e., position in the interface).

```js
var $tabIndex = $tab.index();
```

---

#### `tabWidth` Property (Read-Only)

_Number_: The current width of each tab, in pixels.


```js
var tabWidth = $chromeTabz._.tabWidth;
```

---

#### `effectiveTabWidth` Property (Read-Only)

_Number_: The current effective width of each tab, in pixels; i.e., `tabWidth` minus any overlap that is applied via the configuration option: `overlapDistance`.


```js
var effectiveTabWidth = $chromeTabz._.effectiveTabWidth;
```

---

#### `tabPositions` Property (Read-Only)

_Array_: The current X (left-offset) positions for each tab.


```js
var tabPositions = $chromeTabz._.tabPositions;
```

---

#### `settings` Property (Read-Only)

_Object_: The currently configured settings for the ChromeTabz instance.

_**Note:** While not enforced, this should be considered a read-only object. Please do not attempt to change settings after the ChromeTabz instance as already been initialized via jQuery._


```js
var settings = $chromeTabz._.settings;
```

---

#### `id` Property (Read-Only)

_Number_: The auto-assigned ID for the ChromeTabz instance; e.g., `0`.

_**Note:** This is simply a numeric counter, starting from `0`. If you have more than a single instance of ChromeTabz in any given DOM, each new instance will then have IDs: `1`, `2`, `3`, etc._


```js
var id = $chromeTabz._.id;
```

---

### `ChromeTabz` Class Method Documentation

#### Underlying Class Instance via jQuery

The class instance can be obtained via jQuery.
Point `$chromeTabz._` to the underlying class instance.

```js
// References we'll work with below.
var $chromeTabz = $('.chrome-tabz').chromeTabz(); // w/ jQuery wrapper.
$chromeTabz._ = $chromeTabz.data('chromeTabz'); // ChromeTabz class instance.
```

---

#### `addTab()` Method

##### Parameters

- `props` _Object_: See: [Tab Properties Documentation](#tab-properties-documentation).
- `setAsCurrent` _Boolean_: Set the new tab as the current active tab? Default: `true`.

##### Returns

A jQuery object representing the new tab object in the DOM.

```js
var $tab = $chromeTabz._.addTab({ url: '1.html' });
```

---

#### `addTabz()` Method

##### Parameters

- `propSets` _Array_: e.g., `[{}, {}, {}]`. See: [Tab Properties Documentation](#tab-properties-documentation).
- `setAsCurrent` _Boolean_: Set the first new tab as the current active tab? Default: `true`.

##### Returns

A jQuery object set representing each new tab object in the DOM.

```js
var $tabz = $chromeTabz._.addTabz([
  { url: '1.html' },
  { url: '2.html' },
  { url: '3.html' },
  {
    title: 'New Tab',
    favicon: 'favicon.png',
    url: 'https://example.com',
  }
]);
```

---

#### `removeTab()` Method

##### Parameters

- `$tab` _jQuery_: i.e., A jQuery object representing a single tab in the DOM.

_**Note:** If the jQuery object contains more than a single tab, only the first tab will be removed; via `$tab.first()`. Therefore, you should call `removeTab()` separately, for each tab you want to remove._

```js
var $tab0 = $('.chrome-tabz .-tab').eq(0);
$chromeTabz._.removeTab($tab0); // Remove first tab (index 0).
```

---

#### `removeTabz()` Method

##### Parameters

- `$tabz` _jQuery_: i.e., A jQuery object representing a set of tab objects in the DOM.

```js
var $tabz = $('.chrome-tabz .-tab').not('.-current');
$chromeTabz._.removeTabz($tabz); // Remove all except the current tab.
```

---

#### `setCurrentTab()` Method

##### Parameters

- `$tab` _jQuery_: i.e., A jQuery object representing a single tab in the DOM.

_**Note:** If the jQuery object contains more than a single tab, only the first tab will be set as current; via `$tab.first()`. Only one tab can be current/active at any given time._

```js
var $tab = $('.chrome-tabz .-tab').eq(2);
$chromeTabz._.setCurrentTab($tab); // Third tab (index 2) is now active.
```

---

#### `updateTab()` Method

##### Parameters

- `$tab` _jQuery_: i.e., A jQuery object representing a single tab in the DOM.
- `props` _Object_: Properties to update. See: [Tab Properties Documentation](#tab-properties-documentation).
- `via` _String_: Optional. This is passed to event callback handlers when the `tabUpdated` event is triggered as a result of calling this method. It certain scenarios, this can help developers decide whether to respond to the update event, or ignore it.

_**Note:** If the jQuery object contains more than a single tab, only the first tab will be updated; via `$tab.first()`. If you need to update multiple tabs, build an iteration of your own._

```js
var $tab = $('.chrome-tabz .-tab').eq(2);
$chromeTabz._.updateTab($tab, {url: 'http://example.com'});
// Third tab (index 2) changes location.
```

Another quick example:

```js
var $tab = $('.chrome-tabz .-tab').eq(1);
$chromeTabz._.updateTab($tab, {
  title: 'Currently Loading...',
  favicon: 'src/images/loading-favicon.gif'
}); // Second tab (index 1) gets a new favicon & title.
```

---

#### `destroy()` Method

Optional. You can use this to cleanup the DOM and do something else.

```js
$chromeTabz._.destroy(); // Destroys events, elements, etc.
$chromeTabz._ = null; // Also kills your own instance reference.
// Killing your own instance reference allows the JavaScript GC to free memory.
```

---

### `ChromeTabz`: jQuery Events Documentation

#### On `constructed` Event

Triggered whenever the class is first being constructed, but before it has been fully initialized; i.e., all properties are set, but the DOM and event handlers have not yet been initialized.

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('constructed', function (event, instance) {
  console.log('Tabs constructed.');
});
```

---

#### On `initialized` Event

Triggered after the class is constructed and fully initialized.

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('initialized', function (event, instance) {
  console.log('Tabs initialized.');
});
```

---

#### On `destroyed` Event

Triggered when the class is destroyed via `destroy()`.

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('destroyed', function (event, instance) {
  console.log('Tabs destroyed.');
});
```

---

#### On `tabAdded` Event

Triggered after each new tab is added to the DOM, but before its properties have been set. The object will exist in the DOM at this point, but things like `favicon:`, `title:`, `url:`, etc. will not yet be defined.

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `$tab` _jQuery_: A jQuery object representing the new tab in the DOM.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('tabAdded', function (event, $tab, instance) {
  console.log('Tab added.', $tab);
});
```

---

#### On `tabUpdated` Event

Triggered when a new tab (or any tab) is updated in some way; e.g., when things like `favicon:`, `title:`, `url:` are set initially or altered later.

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `$tab` _jQuery_: A jQuery object representing the tab in the DOM.
- `props` _Object_: See: [Tab Properties Documentation](#tab-properties-documentation). This is a full & complete tab properties object representing the current state of the tab; i.e., after the update occurred. Any properties that were not updated, will have already been set to either their original/previous value, or to the default value in accordance with `setttings.defaultProps`. Again, this represents the current state of the tab in a full & complete way.
- `via` _String_ (or `undefined`): This is an optional identifier passed to the underlying `updateTab()` method. If the original caller defined this variable, it is passed in the event to help listeners recognize who/what originated the call to `updateTab()`. For example, if you call `updateTab()` yourself, and you are _also_ listening to the `tabUpdated` event, you can pass the `via` parameter to `updateTab()`, and then look for it in your own listener — choosing to respond or ignore.
- `prevProps` _Object_: The previous tab properties, before the update. This is either the full & complete tab properties object prior to the update, or an empty object in the case of a new tab having its properties set/updated for the first time.
- `newProps` _Object_: The new tab properties that were set by this update. This is not a full & complete tab properties object. It will only contain properties that were updated.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('tabUpdated', function (event, $tab, props, via, prevProps, newProps, instance) {
  console.log('Tab updated.', $tab, props, via, prevProps, newProps);
});
```

---

#### On `currentTabChanged` Event

Triggered when the current/active tab is changed.

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `$tab` _jQuery_: A jQuery object representing the current/active tab in the DOM.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('currentTabChanged', function (event, $tab, instance) {
  console.log('Current tab changed to.', $tab);
});
```

---

#### On `tabDragStarted` Event

Triggered when a tab is being dragged (i.e., first locked onto).

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `$tab` _jQuery_: A jQuery object representing the tab in the DOM.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('tabDragStarted', function (event, $tab, instance) {
  console.log('Tab drag started.', $tab);
});
```

---

#### On `tabDragMoved` Event

Triggered when a tab is being dragged into a new location, but before it has been dropped and locked into that new location.

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `$tab` _jQuery_: A jQuery object representing the tab in the DOM.
- `indexes` _Object_: `{prevIndex: [Number], newIndex: [Number]}`. Indicating both the old and new location of the tab, based on its index position in the DOM. jQuery uses a zero-based index, so a tab that has a `newIndex` of `0` will be in the first position (first child). You can also determine the current index using `$tab.index()` — a method provided by jQuery.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('tabDragMoved', function (event, $tab, indexes, instance) {
  console.log('Tab dragged to a new location.', $tab, indexes);
});
```

---

#### On `tabDragStopped` Event

Triggered when a tab is dropped and locked into a new location. The location will have already been determined ahead of time and reported via the `tabDragMoved` event. Therefore, there's little reason to attach to this event. Generally speaking, it's better to use `tabDragMoved`. This `tabDragStopped` event simply indicates the end-user is done moving things around — nothing more.

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `$tab` _jQuery_: A jQuery object representing the tab in the DOM.
- `newIndex` _Number_: jQuery uses a zero-based index, so a tab that has a `newIndex` of `0` will be in the first position (first child). You can also determine the current index using `$tab.index()` — a method provided by jQuery.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('tabDragStopped', function (event, $tab, newIndex, instance) {
  console.log('Tab drag stopped.', $tab, newIndex);
});
```

---

#### On `tabBeingRemoved` Event

Triggered right before a tab is about to be removed from the DOM.

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `$tab` _jQuery_: A jQuery object representing the tab in the DOM.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('tabBeingRemoved', function (event, $tab, instance) {
  console.log('Tab will be removed.', $tab);
});
```

---

#### On `tabRemoved` Event

Triggered right after a tab is removed from the DOM.

##### Callback Parameters

- `event` _Object_: The event object properties passed by jQuery.
- `$tab` _jQuery_: A jQuery object representing the tab in the DOM.
- `instance` _ChromeTabz_: The associated ChromeTabz class instance.

```js
$chromeTabz.on('tabRemoved', function (event, $tab, instance) {
  console.log('Tab removed.', $tab);
});
```

---

### TODO: `ChromeTabViewz` Documentation

There are some other low-level properties, methods, and events associated with Viewz being altered in response to Tabz being altered. For the most part, these are for internal use only, but eventually I'd like to document everything. For now, here is a quick look at the View events that are available.

```js
// References we'll work with below.
var $chromeTabz = $('.chrome-tabz').chromeTabz(); // w/ jQuery wrapper.
$chromeTabz._ = $chromeTabz.data('chromeTabz'); // ChromeTabz class instance.

// Additional references we'll work with below.
var $chromeTabViewz = $chromeTabz._.$viewz; // jQuery wrapper for `.chrome-tabz > .-viewz`.
$chromeTabViewz._ = $chromeTabViewz.data('chromeTabViewz'); // ChromeTabViewz class instance.

$chromeTabViewz.on('constructed', function (event, instance){ console.log('Viewz constructed.'); });
$chromeTabViewz.on('initialized', function (event, instance){ console.log('Viewz initialized.'); });
$chromeTabViewz.on('destroyed', function (event, instance){ console.log('Viewz destroyed.'); });

$chromeTabViewz.on('viewIndexed', function (event, view, locations, instance){ console.log('View indexed.', view, locations); });
$chromeTabViewz.on('viewAdded', function (event, view, instance){ console.log('View added.', view); });
$chromeTabViewz.on('viewUpdated', function (event, view, props, via, prevProps, newProps, instance){ console.log('View props updated.', view, props, via, prevProps, newProps); });
$chromeTabViewz.on('currentViewChanged', function (event, view, instance){ console.log('Current view changed to.', view); });

$chromeTabViewz.on('viewBeingRemoved', function (event, view, instance){ console.log('View will be removed.', view); });
$chromeTabViewz.on('viewRemoved', function (event, view, instance){ console.log('View removed.', view); });

$chromeTabViewz.on('viewStartedLoading', function (event, view, instance){ console.log('View started loading.', view); });
$chromeTabViewz.on('viewFaviconUpdated', function (event, view, favicon, instance){ console.log('View favicon updated.', view, favicon); });
$chromeTabViewz.on('viewTitleUpdated', function (event, view, title, instance){ console.log('View title updated.', view, title); });
$chromeTabViewz.on('viewStoppedLoading', function (event, view, instance){ console.log('View stopped loading.', view); });
```
