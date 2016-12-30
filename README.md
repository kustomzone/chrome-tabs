## Chrome Tabz

<img src="https://media.githubusercontent.com/media/jaswsinc/chrome-tabz/dev/assets/images/electron-icon.png" width="128" align="right" />

[Electron](http://electron.atom.io/) and/or browser compatible HTML/CSS and JS chrome tabs — with a jQuery wrapper.

_~ Inspired by and based on the [original](https://github.com/alanshaw/br-chrome-tabs) Chrome Tabs by [@alanshaw](https://github.com/alanshaw)._

This is an ES6 project that I started for Electron [`<webview>`](http://electron.atom.io/docs/api/web-view-tag/) tags. However, it also supports [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) tags in modern web browsers that support ES5+, i.e., _`dists/js/bundle.min.js` is transpiled into traditional JS for browser compat._

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
$ npm install chrome-tabz
```

#### Installing Composer Package

```
$ composer require jaswsinc/chrome-tabz
```

---

### [Electron](http://electron.atom.io/) Tabbed Interface Implementation

<img src="https://media.githubusercontent.com/media/jaswsinc/chrome-tabz/dev/assets/images/electron-icon.png" width="128" align="right" />

ChromeTabz requires a `window.document` object. Generally speaking, most NodeJS projects do not incorporate a web browser. However, there are some exceptions, and Electron apps are one of those. **ChromeTabz works great as a tabbed interface for Electron apps!**

#### Required CSS/Styles

This goes in your `.html` document; i.e., in an Electron Renderer Process.

```html
<link rel="stylesheet" href="node_modules/chrome-tabz/src/css/base.min.css" />
<link rel="stylesheet" href="node_modules/chrome-tabz/src/css/dark.min.css" />
```

#### Required HTML Markup

Again, this goes in your `.html` document; i.e., in an Electron Renderer Process.

```html
<div class="chrome-tabz"></div>
```

#### Required JavaScript Snippet

Again, this goes in an Electron Renderer Process.

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

#### Required CSS/Styles

```html
<link rel="stylesheet" href="src/css/base.min.css" />
<link rel="stylesheet" href="src/css/dark.min.css" />
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
  rightMargin: 300,
  overlapDistance: 14,

  viewz: 'iframes',
  // `iframes` or `webviews`.
  // `webviews` = Electron compatibility.
  // Or leave empty to disable viewz entirely.

  initialTabz: [],

  defaultProps: {
    title: 'New Tab',
    favicon: 'src/images/default-favicon.png',
    url: 'https://duckduckgo.com/?kae=b&kak=-1&kao=-1&k1=-1&kt=p&kj=f5f5f5&ka=p&kf=1&kam=google-maps&km=l&ko=1',

    unknownUrlTitle: 'Web Page',
    loadingFavicon: 'src/images/loading-favicon.gif',

    viewAttrs: {}
  },
});
```

### jQuery Config Option Documentation

- `minWidth: 45` The minimum width of each tab, in pixels. When new tabs are added, or when a window is resized, the width of each tab changes automatically. This setting controls the absolute minimum width allowed for each tab.

- `maxWidth: 243` The maximum width of each tab, in pixels. When old tabs are removed, or when a window is resized, the width of each tab changes automatically. This setting controls the absolute maximum width allowed for each tab.

- `rightMargin: 300` This is the margin on the right-hand side of the entire tab group, in pixels. The default value gives you room to add your own custom UI elements that sit inside the tabbed interface, and your custom UI elements will have `300` pixels of space that they can consume; i.e., without being covered up by a long list of tabs created by an end-user.

- `overlapDistance: 14` This is the amount of tab overlap, in pixels. Each tab overlaps the previous tab by this number of pixels in order to mimic Google Chrome's interface design.

- `viewz: 'iframes'` This controls the underlying sub-class for Chrome Tab Viewz. If you set this to an empty string, all you get are the tabs; i.e., you can then attach your own event handlers that load whatever content is associated with a given tab. If you set this to `iframes`, when a tab is selected a `url:` tab property is loaded automatically in an [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe). Or, in Electron, you can set this to `webviews`. When a tab is selected, the `url:` tab property is loaded in a [`<webview>`](http://electron.atom.io/docs/api/web-view-tag/) tag automatically.

  In short, Viewz make Tabz function like they would in a typical web browser. If you disable viewz by setting this to an empty string, then you'll need your own event handlers that load content in one way or another; e.g., via AJAX, iframes of your choosing, etc.

- `initialTabz: []` When you want to begin with a specific set of tabs, this option comes in handy, as a convenience. Add a set of properties for each tab that you want to initialize. _**Tip:** Any properties that you don't set, for any given tab, will automatically inherit from the list of `defaultProps: {}`, which is also a configurable option_

  ```js
  initialTabz: [
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
      favicon: 'src/images/default-favicon.png',
      url: 'https://duckduckgo.com/?kae=b&kak=-1&kao=-1&k1=-1&kt=p&kj=f5f5f5&ka=p&kf=1&kam=google-maps&km=l&ko=1',
    }
  ]
  ```

- `defaultProps: {}` This is a set of default tab properties that each new tab will inherit from. By configuring default properties, you establish traits that every new tab will have by default, and then you can override these defaults when new tabs are being added. In short, this saves you from repeating yourself. This also establishes what a new tab will look like whenever a user double-clicks the tabbed interface.

  ```js
  defaultProps: {
    title: 'New Tab',
    favicon: 'src/images/default-favicon.png',
    url: 'https://duckduckgo.com/?kae=b&kak=-1&kao=-1&k1=-1&kt=p&kj=f5f5f5&ka=p&kf=1&kam=google-maps&km=l&ko=1',

    unknownUrlTitle: 'Web Page',
    loadingFavicon: 'src/images/loading-favicon.gif',

    viewAttrs: {}
  }
  ```

  _**Notable Exception:** When a tab is given a `url:` property, its `favicon:` and `title:` properties do not inherit from any defaults. Even setting the `title:` or `favicon:` properties explicitly will have little impact. Instead, the favicon & title are automatically derived from the URL itself, as one would expect from any web browser._

    _On the other hand, if you're using `viewz: 'iframes'`, and you attempt to add a tab with a URL that is not on the same domain as your tabbed interface, browser security restrictions do not allow for automatic detection. In such a case, explicit `favicon:` and `title:` properties must be set for each tab. Note also, this does not apply to Electron `<webview>` tags, which are not subjected to the same cross-domain limitations as `<iframe>` tags._


---

### Tab Properties Documentation

```js
title: 'New Tab',
favicon: 'src/images/default-favicon.png',
url: 'https://duckduckgo.com/?kae=b&kak=-1&kao=-1&k1=-1&kt=p&kj=f5f5f5&ka=p&kf=1&kam=google-maps&km=l&ko=1',

unknownUrlTitle: 'Web Page',
loadingFavicon: 'src/images/loading-favicon.gif',

viewAttrs: {}
```

- `title: ''` Establishes the default title for a tab.

- `favicon: ''` Establishes the favicon for a tab. This can be a `data:` URI, a relative image path (svg,png,gif,ico), or a full URL leading to an image.

- `url: ''` This establishes the content for the tab 'view'; i.e., the location of the content that should be displayed whenever the tab is active.

  _**Special Note:** When a tab is given a `url:` property, its `favicon:` and `title:` properties do not inherit from any defaults. Even setting the `title:` or `favicon:` properties explicitly will have little impact. Instead, the favicon & title are automatically derived from the URL itself, as one would expect from any web browser._

    _On the other hand, if you're using `viewz: 'iframes'`, and you attempt to add a tab with a URL that is not on the same domain as your tabbed interface, browser security restrictions do not allow for automatic detection. In such a case, explicit `favicon:` and `title:` properties must be set for each tab. Note also, this does not apply to Electron `<webview>` tags, which are not subjected to the same cross-domain limitations as `<iframe>` tags._

- `unknownUrlTitle: ''` In the case of URL loading failure, or when cross-domain restrictions prohibit automatic title detection (based on URL), this default title will be displayed instead.

- `loadingFavicon: ''` Establishes the loading favicon. This can be a `data:` URI, a relative image path (svg,png,gif,ico), or a full URL leading to an image. An animated gif image is strongly recommended, which helps to convey that a tab is loading.

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

### Underlying Class Instance

#### Gaining Access to Class Instance

Point `$chromeTabz._` to the underlying class instance.

```js
// References we'll work with below.
var $chromeTabz = $('.chrome-tabz'); // DOM object w/ jQuery wrapper.
$chromeTabz._ = $chromeTabz.data('chromeTabz'); // Class instance.
```

#### Setting the Current Active Tab

_**Note:** Tabs have a zero-based index. Tab three has index `2`._

```js
var $tab3 = $('.chrome-tabz .-tab').eq(2);
$chromeTabz._.setCurrentTab($tab3);
```

#### Adding New Tabs

Each of these will be added to any tabs that exist already.

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
// Note: `$tabz` will contain a jQuery object set with
// all of the tabs created by the API call that you made.
```

#### Removing a Tab

This removes tab at index position `0`, via the reference we obtained above when new tabs were added; i.e., using the new set of jQuery `$tabz` (see previous example).

```js
$chromeTabz._.removeTab($tabz.eq(0));
```

You can also remove a tab by querying for it in the DOM.

```js
var $tab0 = $('.chrome-tabz .-tab').eq(0);
$chromeTabz._.removeTab($tab0);
```

#### Removing all tabs.

```js
$('.chrome-tabz .-tab').each(function(i, obj) {
  var $tab = $(obj);
  $chromeTabz._.removeTab($tab);
});
```

#### Removing the current active tab.

```js
$chromeTabz._.removeTab($chromeTabz._.$currentTab);
```
