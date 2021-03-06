/**
 * @ignore
 * getScript support for css and js callback after load
 * @author yiminghe@gmail.com
 */
(function (mx) {
    var MILLISECONDS_OF_SECOND = 1000;
    var win = mx.Env.host;
    var doc = win.document;
    var Utils = mx.Loader.Utils;
    // solve concurrent requesting same script file
    var jsCssCallbacks = {};
    var webkit = Utils.webkit;
    var headNode;

    /**
     * Load a javascript/css file from the server using a GET HTTP request,
     * then execute it.
     *
     * for example:
     *      @example
     *      modulex.getScript(url, success, charset);
     *      // or
     *      modulex.getScript(url, {
     *          charset: string
     *          success: fn,
     *          error: fn,
     *          timeout: number
     *      });
     *
     * Note 404/500 status in ie<9 will trigger success callback.
     *
     * @param {String} url resource's url
     * @param {Function|Object} [success] success callback or config
     * @param {Function} [success.success] success callback
     * @param {Function} [success.error] error callback
     * @param {Number} [success.timeout] timeout (s)
     * @param {String} [success.charset] charset of current resource
     * @param {String} [charset] charset of current resource
     * @return {HTMLElement} script/style node
     * @member modulex
     */
    mx.getScript = function (url, success, charset) {
        // can not use modulex.Uri, url can not be encoded for some url
        // eg: /??dom.js,event.js , ? , should not be encoded
        var config = success;
        var css = Utils.endsWith(url, '.css');
        var error, timeout, attrs, callbacks, timer;
        if (typeof config === 'object') {
            success = config.success;
            error = config.error;
            timeout = config.timeout;
            charset = config.charset;
            attrs = config.attrs;
        }
        if (css && Utils.ieMode < 10) {
            if (doc.getElementsByTagName('style').length + doc.getElementsByTagName('link').length >= 31) {
                if (win.console) {
                    win.console.error('style and link\'s number is more than 31.' +
                        'ie < 10 can not insert link: ' + url);
                }
                if (error) {
                    error();
                }
                return;
            }
        }
        callbacks = jsCssCallbacks[url] = jsCssCallbacks[url] || [];
        callbacks.push([success, error]);
        if (callbacks.length > 1) {
            return callbacks.node;
        }
        var node = doc.createElement(css ? 'link' : 'script');
        var clearTimer = function () {
            if (timer) {
                clearTimeout(timer);
                timer = undefined;
            }
        };
        if (attrs) {
            Utils.each(attrs, function (v, n) {
                node.setAttribute(n, v);
            });
        }
        if (charset) {
            node.charset = charset;
        }
        if (css) {
            node.href = url;
            node.rel = 'stylesheet';
            // can not set, else test fail
            // node.media = 'async';
        } else {
            node.src = url;
            node.async = true;
        }
        callbacks.node = node;
        var end = function (error) {
            var index = error;
            var fn;
            clearTimer();
            Utils.each(jsCssCallbacks[url], function (callback) {
                if ((fn = callback[index])) {
                    fn.call(node);
                }
            });
            delete jsCssCallbacks[url];
        };
        var useNative = 'onload' in node;
        // onload for webkit 535.23  Firefox 9.0
        // https://bugs.webkit.org/show_activity.cgi?id=38995
        // https://bugzilla.mozilla.org/show_bug.cgi?id=185236
        // https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
        // phantomjs 1.7 == webkit 534.34
        var forceCssPoll = mx.Config.forceCssPoll ||
            (webkit && webkit < 536) ||
            // unknown browser defaults to css poll
            // https://github.com/kissyteam/modulex/issues/607
            (!webkit && !Utils.trident && !Utils.gecko);
        if (css && forceCssPoll && useNative) {
            useNative = false;
        }
        function onload() {
            var readyState = node.readyState;
            if (!readyState ||
                readyState === 'loaded' ||
                readyState === 'complete') {
                node.onreadystatechange = node.onload = null;
                end(0);
            }
        }
        //标准浏览器 css and all script
        if (useNative) {
            node.onload = onload;
            node.onerror = function () {
                node.onerror = null;
                end(1);
            };
        } else if (css) {
            // old chrome/firefox for css
            Utils.pollCss(node, function () {
                end(0);
            });
        } else {
            node.onreadystatechange = onload;
        }
        if (timeout) {
            timer = setTimeout(function () {
                end(1);
            }, timeout * MILLISECONDS_OF_SECOND);
        }
        if (!headNode) {
            headNode = Utils.docHead();
        }
        if (css) {
            // css order matters
            // so can not use css in head
            headNode.appendChild(node);
        } else {
            // can use js in head
            headNode.insertBefore(node, headNode.firstChild);
        }
        return node;
    };
})(modulex);
/*
 yiminghe@gmail.com refactor@2012-03-29
 - 考虑连续重复请求单个 script 的情况，内部排队

 yiminghe@gmail.com 2012-03-13
 - getScript
 - 404 in ie<9 trigger success , others trigger error
 - syntax error in all trigger success
 */