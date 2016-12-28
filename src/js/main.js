// jshint esversion: 6

($ => {
  'use strict;';

  // Begin statics.

  let tabTemplate = `
    <div class="-tab">
      <div class="-background">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <symbol id="topleft" viewBox="0 0 214 29" >
              <path d="M14.3 0.1L214 0.1 214 29 0 29C0 29 12.2 2.6 13.2 1.1 14.3-0.4 14.3 0.1 14.3 0.1Z"/>
            </symbol>
            <symbol id="topright" viewBox="0 0 214 29">
              <use xlink:href="#topleft"/>
            </symbol>
            <clipPath id="crop">
              <rect class="mask" width="100%" height="100%" x="0"/>
            </clipPath>
          </defs>
          <svg width="50%" height="100%" transfrom="scale(-1, 1)">
            <use xlink:href="#topleft" width="214" height="29" class="-background"/>
            <use xlink:href="#topleft" width="214" height="29" class="-shadow"/>
          </svg>
          <g transform="scale(-1, 1)">
            <svg width="50%" height="100%" x="-100%" y="0">
              <use xlink:href="#topright" width="214" height="29" class="-background"/>
              <use xlink:href="#topright" width="214" height="29" class="-shadow"/>
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
    get tabz() {
      return this.$tabz;
    }

    get $tabz() {
      return this.$content.find('> .-tab');
    }

    get currentTab() {
      return this.$currentTab;
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

        initialTabs: [], // Array of props.

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

      this.$obj = this.obj = $(this.settings.obj);
      this.$obj.data('instance', this);

      this.$bar = this.bar = $('<div class="-bar"></div>');
      this.$content = this.content = $('<div class="-content"></div>');
      this.$bottomLine = this.bottomLine = $('<div class="-bottom-line"></div>');

      this.$viewz = this.viewz = $('<div class="-viewz"></div>');
      this.$styles = this.styles = $('<style></style>');

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

      if (this.settings.initialTabs) {
        this.addTabs(this.settings.initialTabs);
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

      this.$obj.removeData('instance');
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
        this.$viewz.data('instance').destroy();
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
        }); // This adds an X offset layout for all tabs.
        this.$styles.html(this.alwaysOnStyles + styles); // Set styles.
      });
    }

    fixStackingOrder() {
      let totalTabs = this.$tabz.length;

      this.$tabz.each((i, tab) => {
        let $tab = $(tab);
        let zindex = totalTabs - i;

        if ($tab.hasClass('-current')) {
          zindex = totalTabs + 2;
          this.$bottomLine.css({ zindex: totalTabs + 1 });
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
      return this.addTabs([props]).eq(0);
    }

    addTabs(propSets) {
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
    get viewz() {
      return this.$viewz;
    }

    get $viewz() {
      return this.$content.find('> .-view');
    }

    get currentView() {
      return this.$currentView;
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

      this.$parentObj = this.parentObj = $(this.settings.parentObj);
      this.$parentObj.instance = this.$parentObj.data('instance');

      this.$obj = this.obj = this.$parentObj.find('> .-viewz');
      this.$obj.data('instance', this); // Class reference.

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

      this.$obj.removeData('instance');
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
          let $tab = this.$parentObj.instance.$tabz.eq(this.mapViewIndex($view, require));
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
              this.$parentObj.instance.updateTab($tab, { favicon, title }, 'view::state-change');

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
              this.$parentObj.instance.updateTab($tab, { favicon }, 'view::state-change');

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
                this.$parentObj.instance.updateTab($tab, { favicon }, 'view::state-change');
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
                this.$parentObj.instance.updateTab($tab, { title }, 'view::state-change');
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
              this.$parentObj.instance.updateTab($tab, { favicon, title }, 'view::state-change');

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
            this.$parentObj.instance.updateTab($tab, { favicon, title }, 'view::state-change');

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
      if (!$(obj).data('instance')) {
        new ChromeTabz($.extend({}, settings || {}, { obj }));
      }
    });
  };
})(jQuery);
