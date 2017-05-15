(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const albums_1 = require("modules/albums");
const tooltips_1 = require("modules/tooltips");
const controls_1 = require("modules/controls");
document.addEventListener('DOMContentLoaded', () => {
    albums_1.initAlbums();
    tooltips_1.initTooltips();
    controls_1.initControls();
    let urlMatch = window.location.pathname.match(/\/a\/([a-zA-Z0-9]*),([a-zA-Z0-9]*)/);
    if (urlMatch && urlMatch[1] && urlMatch[2]) {
        let source1 = urlMatch[1];
        let source2 = urlMatch[2];
        controls_1.setSources([source1, source2]);
    }
});

},{"modules/albums":2,"modules/controls":3,"modules/tooltips":4}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dom_1 = require("utils/dom");
const strings_1 = require("utils/strings");
const window_1 = require("utils/window");
const functions_1 = require("utils/functions");
const analytics_1 = require("services/analytics");
let albumsContainer = null;
let currentIndex = -1;
let currentTargetPair = null;
let albumCount = 0;
let pairEls = [];
let scrollLock = false;
let scrollTimer = null;
const KeyCodes = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
};
function initAlbums() {
    albumsContainer = document.querySelector('#albums');
    albumsContainer.addEventListener('change', (e) => {
        let val = e.target.value;
        let i = parseInt(e.target.dataset['i']);
        showImage(i, val);
    });
    window.addEventListener('keydown', (e) => {
        //noinspection TypeScriptUnresolvedFunction
        let doCareAbout = Object.values(KeyCodes).indexOf(e.keyCode) > -1;
        if (doCareAbout) {
            if (e.keyCode == KeyCodes.DOWN) {
                nextPair();
            }
            if (e.keyCode == KeyCodes.UP) {
                prevPair();
            }
            if (e.keyCode == KeyCodes.RIGHT) {
                nextImage();
            }
            if (e.keyCode == KeyCodes.LEFT) {
                prevImage();
            }
        }
    });
    window.addEventListener('scroll', debouncedAdjustScroll);
}
exports.initAlbums = initAlbums;
function adjustCurrentFromScroll(e) {
    if (scrollLock)
        return;
    let top = window.scrollY;
    let pairElTops = pairEls.map(e => e.offsetTop);
    for (let i = 0; i < pairElTops.length; i++) {
        let next = pairElTops[i + 1];
        if (next && top + 200 < next) {
            if (currentTargetPair) {
                currentTargetPair.classList.remove('is-focused');
            }
            currentIndex = i;
            let target = pairEls[i];
            target.classList.add('is-focused');
            currentTargetPair = target;
            break;
        }
    }
}
let debouncedAdjustScroll = functions_1.debounce(adjustCurrentFromScroll, 500);
function nextPair() {
    currentIndex++;
    if (currentIndex >= albumCount) {
        currentIndex = 0;
    }
    scrollToPair(currentIndex);
}
function prevPair() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = albumCount - 1;
    }
    scrollToPair(currentIndex);
}
function scrollToPair(i) {
    if (scrollLock) {
        return;
    }
    if (currentTargetPair) {
        currentTargetPair.classList.remove('is-focused');
    }
    let target = pairEls[i];
    target.classList.add('is-focused');
    currentTargetPair = target;
    window.removeEventListener('scroll', debouncedAdjustScroll);
    let duration = window_1.smoothScroll(target);
    clearTimeout(scrollTimer);
    scrollLock = true;
    scrollTimer = setTimeout(() => {
        scrollLock = false;
        window.addEventListener('scroll', debouncedAdjustScroll);
    }, duration + 1);
}
function showImage(i, val) {
    let target = albumsContainer.querySelector(`[data-i="${i}"]`);
    target.dataset['show'] = val;
}
function nextImage() {
    let target = albumsContainer.querySelector(`[data-i="${currentIndex}"]`);
    let vals = Array.prototype.slice.call(target.querySelectorAll('.src-toggle'), 0);
    let i = vals.findIndex(v => !!v.checked);
    i++;
    if (i > vals.length - 1) {
        i = 0;
    }
    let val = vals[i].value;
    vals[i].checked = true;
    showImage(currentIndex, val);
}
function prevImage() {
    let target = albumsContainer.querySelector(`[data-i="${currentIndex}"]`);
    let vals = Array.prototype.slice.call(target.querySelectorAll('.src-toggle'), 0);
    let i = vals.findIndex(v => !!v.checked);
    i--;
    if (i < 0) {
        i = vals.length - 1;
    }
    let val = vals[i].value;
    vals[i].checked = true;
    showImage(currentIndex, val);
}
function renderAlbums(album1, album2) {
    analytics_1.default.trackEvent({
        action: analytics_1.EventActions.UPDATE,
        category: analytics_1.EventCategories.VIEWER,
        label: analytics_1.EventLabels.ALBUM_SOURCES,
        dimensions: {
            [analytics_1.Dimensions.SOURCES]: [album1.id, album2.id].join(','),
            [analytics_1.Dimensions.SOURCE_ONE]: album1.id,
            [analytics_1.Dimensions.SOURCE_TWO]: album2.id,
        }
    });
    let count = Math.max(album1.images.length, album2.images.length);
    let labels = strings_1.diff(album1.title, album2.title);
    pairEls = [];
    albumsContainer.innerHTML = '';
    albumCount = count;
    for (let i = 0; i < count; i++) {
        let i1 = album1.images[i];
        let i2 = album2.images[i];
        let rawTitle = strings_1.shared(i1.title, i2.title);
        let title = `#${i + 1}${rawTitle ? ` - ${rawTitle}` : ''}`;
        let el = renderImagePair(i, title, {
            src: i1.link,
            desc: i1.description,
            label: labels[0]
        }, {
            src: i2.link,
            desc: i2.description,
            label: labels[1]
        });
        pairEls.push(el);
    }
    currentIndex = 0;
    currentTargetPair = pairEls[0];
    currentTargetPair.classList.add('is-focused');
}
exports.renderAlbums = renderAlbums;
function renderImagePair(i, title, i1, i2) {
    let imagePairElement = dom_1.createElement(`
    <div class="image-pair" data-i="${i}" data-show="a">
      <div class="image-pair__controls">
        <span class="pair-id">${title}</span>
        <fieldset class="src-toggle-container">
          <span>
            <input class="src-toggle" type="radio" id="${i}a" name="pair-${i}" data-i="${i}" value="a" checked />
            <label for="${i}a">${i1.label || 'A'}</label>
          </span>
          <span>
            <input class="src-toggle" type="radio" id="${i}b" name="pair-${i}" data-i="${i}" value="b" />
            <label for="${i}b">${i2.label || 'B'}</label>
          </span>
        </fieldset>
      </div>
      <div class="image-pair__sources">
        <div class="image" data-id="a">
          <div class="image-pair__src-wrapper">
            <img class="image__src" src="${i1.src}" />
          </div>
          <div class="image__desc">
            <p>${i1.desc || (i2.desc ? `<span class="assumed-desc">[${i2.desc}]</span>` : '')}</p>
          </div>
        </div>
        <div class="image" data-id="b">
          <div class="image-pair__src-wrapper">
            <img class="image__src" src="${i2.src}" />
          </div>
          <div class="image__desc">
            <p>${i2.desc || (i1.desc ? `<span class="assumed-desc">[${i1.desc}]</span>` : '')}</p>
          </div>
        </div>
      </div>
    </div>
  `);
    albumsContainer.appendChild(imagePairElement);
    return imagePairElement;
}

},{"services/analytics":5,"utils/dom":8,"utils/functions":9,"utils/strings":12,"utils/window":13}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imgur_1 = require("services/imgur");
const albums_1 = require("modules/albums");
const copy_1 = require("utils/copy");
const tooltips_1 = require("modules/tooltips");
const analytics_1 = require("services/analytics");
let updateButton = document.querySelector('#submit');
let shareButton = document.querySelector('#share');
let sourceForm = document.querySelector('#sourceForm');
let source1Input = document.querySelector('#source1');
let source2Input = document.querySelector('#source2');
function onInputChange() {
    let val1 = source1Input.value;
    let val2 = source2Input.value;
    if (val1 && val2) {
        updateButton.disabled = false;
    }
    else {
        updateButton.disabled = true;
    }
}
function update(values) {
    let val1 = values[0];
    let val2 = values[1];
    shareButton.disabled = false;
    imgur_1.default.requestAlbumImages([
        val1, val2,
    ])
        .then(albums => {
        if (albums[0] && albums[1]) {
            albums_1.renderAlbums(albums[0], albums[1]);
            window.history.replaceState({
                html: null,
                pageTitle: 'contrast.li',
            }, '', `/a/${albums[0].id},${albums[1].id}`);
        }
        else {
            window['Raven'].captureMessage(`Invalid album IDS: ${val1}, ${val2}`);
        }
    });
    onInputChange();
}
function setSources(sources) {
    let source1 = sources[0];
    let source2 = sources[1];
    source1Input.value = source1;
    source2Input.value = source2;
    update([source1, source2]);
}
exports.setSources = setSources;
function initControls() {
    source1Input.addEventListener('keydown', onInputChange);
    source2Input.addEventListener('keydown', onInputChange);
    sourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (updateButton.disabled)
            return;
        let val1 = source1Input.value;
        let val2 = source2Input.value;
        analytics_1.default.trackEvent({
            action: analytics_1.EventActions.CLICK,
            category: analytics_1.EventCategories.CONTROLS,
            label: analytics_1.EventLabels.UPDATE_BUTTON,
            dimensions: {
                [analytics_1.Dimensions.SOURCES]: [val1, val2].join(','),
                [analytics_1.Dimensions.SOURCE_ONE]: val1,
                [analytics_1.Dimensions.SOURCE_TWO]: val2,
            }
        });
        update([val1, val2]);
    });
    shareButton.addEventListener('click', (e) => {
        let copied = copy_1.copyTextToClipboard(window.location.href);
        if (copied) {
            tooltips_1.show('URL copied to clipboard!', shareButton);
        }
        else {
            tooltips_1.show(`Couldn't copy.`, shareButton);
        }
    });
}
exports.initControls = initControls;

},{"modules/albums":2,"modules/tooltips":4,"services/analytics":5,"services/imgur":6,"utils/copy":7}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let tooltip = null;
let isHovered = false;
let hideTimer = null;
function show(content, anchor) {
    let top = anchor.offsetTop;
    let left = anchor.offsetLeft;
    let height = anchor.offsetHeight;
    tooltip.innerHTML = content;
    tooltip.style.display = `block`;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top + height}px`;
}
exports.show = show;
function hide() {
    tooltip.innerHTML = '';
    tooltip.style.display = 'none';
}
exports.hide = hide;
function initTooltips() {
    tooltip = document.querySelector('#tooltip');
    let triggers = Array.prototype.slice.call(document.querySelectorAll('[data-tooltip]'), 0);
    triggers.forEach(target => {
        target.addEventListener('mouseenter', (e) => {
            clearTimeout(hideTimer);
            let tooltipTemplate = target.dataset['tooltip'];
            if (tooltipTemplate) {
                let selector = `[data-template="${tooltipTemplate}"]`;
                let template = document.querySelector(selector);
                show(template.innerHTML, target);
            }
        });
        target.addEventListener('mouseleave', (e) => {
            clearTimeout(hideTimer);
            if (!isHovered) {
                hideTimer = setTimeout(hide, 300);
            }
        });
    });
    tooltip.addEventListener('mouseenter', (e) => {
        clearTimeout(hideTimer);
        isHovered = true;
    });
    tooltip.addEventListener('mouseleave', (e) => {
        clearTimeout(hideTimer);
        isHovered = false;
        hideTimer = setTimeout(hide, 300);
    });
}
exports.initTooltips = initTooltips;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pages = {
    INDEX: '/',
};
exports.Pages = Pages;
const EventCategories = {
    CONTROLS: 'controls',
    VIEWER: 'viewer',
};
exports.EventCategories = EventCategories;
const EventActions = {
    CLICK: 'click',
    HOVER: 'hover',
    SELECTED: 'selected',
    UPDATE: 'update'
};
exports.EventActions = EventActions;
const EventLabels = {
    SOURCE_INPUT: 'source-input',
    SOURCE_TOOLTIP: 'source-tooltip',
    UPDATE_BUTTON: 'update-button',
    SHARE_BUTTON: 'share-button',
    ALBUM_SOURCES: 'album-sources',
};
exports.EventLabels = EventLabels;
const Dimensions = {
    SOURCES: 'dimension0',
    SOURCE_ONE: 'dimension1',
    SOURCE_TWO: 'dimension2',
};
exports.Dimensions = Dimensions;
exports.default = {
    /**
     * Tracks a page view.
     *
     * @param {string} path - The path of the current URL. Prefixed with '/'
     */
    trackPageView(path) {
        window['ga']('send', {
            hitType: 'pageview',
            page: path
        });
    },
    /**
     * Tracks an event or interaction on the page.
     *
     * @param {string} category - The type of thing interacted with. (eg. Video)
     * @param {string} action - The type of interaction. (eg. play)
     * @param {string?} label - Typically a subcategory.
     * @param {number?} value - A useful and unique identification of the thing interacted with.
     * @param {Object<string, *>?} dimensions - A key-value map of dimension parameters.
     */
    trackEvent({ category, action, label, value, dimensions }) {
        let event = Object.assign({
            hitType: 'event'
        }, {
            eventCategory: category,
            eventAction: action,
            eventLabel: label,
            eventValue: value
        }, dimensions);
        window['ga']('send', event);
    }
};

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("utils/http");
function parseId(string) {
    let m = string.match(/a\/(.*)/);
    return m && m[1] ? m[1] : string;
}
function requestAlbumImages(sources) {
    let ids = sources.map(s => parseId(s));
    let requests = ids.map((id) => {
        return http_1.default.get(`/album/${id}`, {});
    });
    return Promise.all(requests)
        .then((responses) => {
        return responses.map((res) => {
            if (res.status == 200) {
                return JSON.parse(res.body).data;
            }
            else {
                return {
                    title: null,
                    images: []
                };
            }
        });
    });
}
exports.default = {
    requestAlbumImages
};

},{"utils/http":10}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function copyTextToClipboard(text) {
    let textArea = document.createElement("textarea");
    let success = false;
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        success = document.execCommand('copy');
    }
    catch (err) {
        console.log('Unable to copy string', err);
        success = false;
    }
    document.body.removeChild(textArea);
    return success;
}
exports.copyTextToClipboard = copyTextToClipboard;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a DOM element from an HTML string.
 *
 * @param {string} html The HTML string to render.
 * @returns {Element} The DOM element constructed.
 */
function createElement(html) {
    let wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstElementChild;
}
exports.createElement = createElement;
/**
 * Finds all elements matching the given selector, within the given root element.
 *
 * @param {Element=document} root The root element to search under.
 * @param {string|Array.<string>} selectors The selectors to query for. If an array,
 * all results are flattened.
 * @returns {Array.<Element>}
 */
function findAll(root, selectors) {
    if (arguments.length == 1) {
        selectors = root;
        root = document.documentElement || document.body;
    }
    if (!Array.isArray(selectors)) {
        selectors = [selectors];
    }
    // Grab elements from all selectors.
    selectors = selectors.map(selector => {
        return Array.prototype.slice.call(root.querySelectorAll(selector), 0);
    });
    // Flatten the elements from all of the selectors.
    return selectors.reduce((all, single) => {
        return all.concat(single);
    }, []);
}
exports.findAll = findAll;
/**
 * Finds a single elemnt matching the given selector, within the given root element.
 *
 * @param {Element=document} root The root element to search under.
 * @param {string} selector The selector to query for.
 * @returns {Element}
 */
function findOne(root, selector) {
    if (arguments.length == 1) {
        selector = root;
        root = document.documentElement || document.body;
    }
    return root.querySelector(selector);
}
exports.findOne = findOne;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wraps a function so that it is only executed after a specified delay.
 *
 * @param {Function} fn The function to execute.
 * @param {number} delay The delay before teh function is executed.
 * @returns {Function} wrapper function
 */
function debounce(fn, delay) {
    let timeoutId = null;
    return function () {
        let args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(null, args), delay);
    };
}
exports.debounce = debounce;
/**
 * Wraps a function so that it's throttled to not executed more than once every
 * so often.
 *
 * @param {Function} fn The function to execute.
 * @param {number} threshold The delay before the function is executed.
 * @returns {Function} wrapper function
 */
function throttle(fn, threshold) {
    let last = null;
    let deferTimer = null;
    return function () {
        let args = arguments;
        let now = +new Date;
        if (last && now < last + threshold) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(() => {
                last = now;
                fn.apply(null, args);
            }, threshold);
        }
        else {
            last = now;
            fn.apply(null, args);
        }
    };
}
exports.throttle = throttle;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objects_1 = require("./objects");
let http = function ({ method, url, params, data, headers }) {
    return new Promise((resolve, reject) => {
        let client = new XMLHttpRequest();
        let uri = url;
        if (params) {
            let queryString = '';
            for (let key in params) {
                if (!params.hasOwnProperty(key))
                    continue;
                let symbol = queryString ? '&' : '?';
                let s = `${symbol}${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
                queryString += s;
            }
            uri += queryString;
        }
        client.open(method, uri);
        if (headers) {
            for (let key in headers) {
                if (headers.hasOwnProperty(key)) {
                    let value = headers[key];
                    client.setRequestHeader(key, value);
                }
            }
        }
        if (data && (method == 'POST' || method == 'PUT' || method == 'PATCH')) {
            client.send(data);
        }
        else {
            client.send();
        }
        client.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve({
                    status: this.status,
                    body: this.response
                });
            }
            else {
                reject({
                    status: this.status,
                    body: this.response
                });
            }
        };
        client.onerror = function () {
            reject({
                status: this.status,
                body: this.response
            });
        };
    });
};
/**
 * Executes a GET request to the specified location.
 *
 * @param {string} url The URL to send the request to.
 * @param {object=} config The full configuration options.
 * @returns {Promise}
 */
http['get'] = (url, config = {}) => http(objects_1.mix({
    url,
    method: 'GET'
}, config));
/**
 * Executes a POST request to the specified location.
 *
 * @param {string} url The URL to send the request to.
 * @param {*=} data The request body.
 * @param {object=} config The full configuration options.
 * @returns {Promise}
 */
http['post'] = (url, data, config = {}) => http(objects_1.mix({
    url,
    data,
    method: 'POST'
}, config));
/**
 * Executes a PATCH request to the specified location.
 *
 * @param {string} url The URL to send the request to.
 * @param {*=} data The request body.
 * @param {object=} config The full configuration options.
 * @returns {Promise}
 */
http['patch'] = (url, data, config = {}) => http(objects_1.mix({
    url,
    data,
    method: 'PATCH'
}, config));
exports.default = http;

},{"./objects":11}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function extend(src, ...objects) {
    for (let i in objects) {
        if (!objects.hasOwnProperty(i))
            continue;
        let obj = objects[i];
        for (let key in obj) {
            if (!obj.hasOwnProperty(key))
                continue;
            if (obj[key] && typeof obj[key] == 'object' && obj[key].constructor == Object) {
                src[key] = mix({}, obj[key]);
            }
            else {
                src[key] = obj[key];
            }
        }
    }
    return src;
}
exports.extend = extend;
function mix(src, ...objects) {
    let copy = extend({}, src);
    return extend(copy, ...objects);
}
exports.mix = mix;
function retrieve(source, path) {
    if (path.indexOf('.') < 0) {
        return source[path];
    }
    else {
        let parts = path.split('.');
        return retrieve(source[parts[0]], parts.slice(1).join('.'));
    }
}
exports.retrieve = retrieve;
function assign(source, path, data) {
    if (path.indexOf('.') < 0) {
        source[path] = data;
    }
    else {
        let parts = path.split('.');
        return assign(source[parts[0]], parts.slice(1).join('.'), data);
    }
}
exports.assign = assign;
function pathsFor(path) {
    return path
        .split('.')
        .map((part, i, paths) => paths.slice(0, i + 1).join('.'));
}
exports.pathsFor = pathsFor;
function crawl(source, callback, path = null) {
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            let value = source[key];
            let valuePath = path ? [path, key].join('.') : key;
            callback(valuePath, value);
            if (typeof value === 'object') {
                crawl(value, callback, valuePath);
            }
        }
    }
}
exports.crawl = crawl;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Removes the given length of a string. If len is negative, will remove from the end.
 *
 * @param {string} str The string to slice
 * @param {number} len The length to remove.
 * @returns {string}
 */
function remove(str, len) {
    return len > 0 ? str.substring(len) : str.substring(0, str.length + len);
}
/**
 * Returns the length of matching characters in the given string, up to the length provided.
 *
 * @param {number} len The max length to count to. Should be the smallest length of all strings.
 * @param {Array<string>} strings The strings to check.
 * @returns {number}
 */
function fromStartLen(len, ...strings) {
    for (let i = 0; i < len; i++) {
        let last = null;
        for (let s = 0; s < strings.length; s++) {
            let c = strings[s][i];
            if (last !== null && c != last) {
                return i;
            }
            last = c;
        }
    }
    return 0;
}
/**
 * Returns the length of matching characters in the given string, counting from the end.
 *
 * @param {number} len The max length to count to. Should be the smallest length of all strings.
 * @param {Array<string>} strings The strings to check.
 * @returns {number}
 */
function fromEndLen(len, ...strings) {
    for (let i = 0; i < len; i++) {
        let last = null;
        for (let s = 0; s < strings.length; s++) {
            let si = strings[s].length - i - 1;
            let c = strings[s][si];
            if (last !== null && c != last) {
                return i;
            }
            last = c;
        }
    }
}
/**
 * Returns the longest non-matching sequence of characters in the string.
 *
 * @param {Array<string>} strings The list of strings to diff.
 * @returns {Array<string>}
 */
function diff(...strings) {
    let len = Math.min.apply(null, strings.map(s => s.length));
    let fromStart = 0;
    let fromEnd = 0;
    fromStart = fromStartLen(len, ...strings);
    if (fromStart >= len / 2) {
        return strings.map(s => remove(s, fromStart));
    }
    fromEnd = fromEndLen(len, ...strings);
    if (fromStart >= fromEnd) {
        return strings.map(s => remove(s, fromStart));
    }
    else {
        return strings.map(s => remove(s, -fromEnd));
    }
}
exports.diff = diff;
/**
 * Returns the longest matching sequence of characters in the string.
 *
 * @param {Array<string>} strings The list of strings to match.
 * @returns {string}
 */
function shared(...strings) {
    strings = strings.filter(s => s != null);
    let len = Math.min.apply(null, strings.map(s => s.length));
    let fromStart = 0;
    let fromEnd = 0;
    if (strings.length == 0) {
        return '';
    }
    if (strings.length == 1) {
        return strings[0];
    }
    fromStart = fromStartLen(len, ...strings);
    if (fromStart >= len / 2) {
        return strings[0].substring(0, fromStart);
    }
    fromEnd = fromEndLen(len, ...strings);
    if (fromStart >= fromEnd) {
        return strings[0].substring(0, fromStart);
    }
    else {
        let s = strings[0];
        return s.substring(s.length - fromEnd);
    }
}
exports.shared = shared;

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function currentYPosition() {
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset)
        return self.pageYOffset;
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop)
        return document.body.scrollTop;
    return 0;
}
function elmYPosition(elm) {
    var y = elm.offsetTop;
    var node = elm;
    while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
    }
    return y;
}
function smoothScroll(elm) {
    var startY = currentYPosition();
    var stopY = elmYPosition(elm);
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 100) {
        scrollTo(0, stopY);
        return 0;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 20)
        speed = 20;
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    var duration = 0;
    if (stopY > startY) {
        for (var i = startY; i < stopY; i += step) {
            setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
            leapY += step;
            if (leapY > stopY)
                leapY = stopY;
            timer++;
            duration = timer * speed;
        }
        return duration;
    }
    for (var i = startY; i > stopY; i -= step) {
        setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
        leapY -= step;
        if (leapY < stopY)
            leapY = stopY;
        timer++;
        duration = timer * speed;
    }
    return duration;
}
exports.smoothScroll = smoothScroll;

},{}]},{},[1])

//# sourceMappingURL=main.js.map
