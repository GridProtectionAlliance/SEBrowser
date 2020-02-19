(function e(t,r){if(typeof exports==="object"&&typeof module==="object")module.exports=r();else if(typeof define==="function"&&define.amd)define([],r);else if(typeof exports==="object")exports["typestyle"]=r();else t["typestyle"]=r()})(this,function(){/******/
return function(e){// webpackBootstrap
/******/
// The module cache
/******/
var t={};/******/
/******/
// The require function
/******/
function r(n){/******/
/******/
// Check if module is in cache
/******/
if(t[n]){/******/
return t[n].exports}/******/
// Create a new module (and put it into the cache)
/******/
var i=t[n]={/******/
i:n,/******/
l:false,/******/
exports:{}};/******/
/******/
// Execute the module function
/******/
e[n].call(i.exports,i,i.exports,r);/******/
/******/
// Flag the module as loaded
/******/
i.l=true;/******/
/******/
// Return the exports of the module
/******/
return i.exports}/******/
/******/
/******/
// expose the modules object (__webpack_modules__)
/******/
r.m=e;/******/
/******/
// expose the module cache
/******/
r.c=t;/******/
/******/
// define getter function for harmony exports
/******/
r.d=function(e,t,n){/******/
if(!r.o(e,t)){/******/
Object.defineProperty(e,t,{/******/
configurable:false,/******/
enumerable:true,/******/
get:n})}};/******/
/******/
// getDefaultExport function for compatibility with non-harmony modules
/******/
r.n=function(e){/******/
var t=e&&e.__esModule?/******/
function t(){return e["default"]}:/******/
function t(){return e};/******/
r.d(t,"a",t);/******/
return t};/******/
/******/
// Object.prototype.hasOwnProperty.call
/******/
r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)};/******/
/******/
// __webpack_public_path__
/******/
r.p="";/******/
/******/
// Load entry module and return exports
/******/
return r(r.s=2)}([/* 0 */
/***/
function(e,t,r){"use strict";/* WEBPACK VAR INJECTION */
(function(e){var r=this&&this.__extends||function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)if(t.hasOwnProperty(r))e[r]=t[r]};return function(t,r){e(t,r);function n(){this.constructor=t}t.prototype=r===null?Object.create(r):(n.prototype=r.prototype,new n)}}();Object.defineProperty(t,"__esModule",{value:true});/**
 * The unique id is used for unique hashes.
 */
var n=0;/**
 * Tag styles with this string to get unique hashes.
 */
t.IS_UNIQUE="__DO_NOT_DEDUPE_STYLE__";var i=/[A-Z]/g;var s=/^ms-/;var a=/&/g;var o=/[ !#$%&()*+,.\/;<=>?@[\]^`{|}~"'\\]/g;var u=function(e){return"-"+e.toLowerCase()};/**
 * CSS properties that are valid unit-less numbers.
 */
var f=["animation-iteration-count","box-flex","box-flex-group","column-count","counter-increment","counter-reset","flex","flex-grow","flex-positive","flex-shrink","flex-negative","font-weight","line-clamp","line-height","opacity","order","orphans","tab-size","widows","z-index","zoom",
// SVG properties.
"fill-opacity","stroke-dashoffset","stroke-opacity","stroke-width"];/**
 * Map of css number properties.
 */
var h=Object.create(null);
// Add vendor prefixes to all unit-less properties.
for(var c=0,l=["-webkit-","-ms-","-moz-","-o-",""];c<l.length;c++){var d=l[c];for(var p=0,y=f;p<y.length;p++){var v=y[p];h[d+v]=true}}/**
 * Escape a CSS class name.
 */
t.escape=function(e){return e.replace(o,"\\$&")};/**
 * Transform a JavaScript property into a CSS property.
 */
function g(e){return e.replace(i,u).replace(s,"-ms-")}t.hyphenate=g;/**
 * Generate a hash value from a string.
 */
function _(e){var t=5381;var r=e.length;while(r--)t=t*33^e.charCodeAt(r);return(t>>>0).toString(36)}t.stringHash=_;/**
 * Transform a style string to a CSS string.
 */
function m(e,t){if(typeof t==="number"&&t!==0&&!h[e]){return e+":"+t+"px"}return e+":"+t}/**
 * Sort an array of tuples by first value.
 */
function S(e){return e.sort(function(e,t){return e[0]>t[0]?1:-1})}/**
 * Categorize user styles.
 */
function w(e,r){var n=[];var i=[];var s=false;
// Sort keys before adding to styles.
for(var a=0,o=Object.keys(e);a<o.length;a++){var u=o[a];var f=e[u];if(f!==null&&f!==undefined){if(u===t.IS_UNIQUE){s=true}else if(typeof f==="object"&&!Array.isArray(f)){i.push([u.trim(),f])}else{n.push([g(u.trim()),f])}}}return{styleString:b(S(n)),nestedStyles:r?i:S(i),isUnique:s}}/**
 * Stringify an array of property tuples.
 */
function b(e){return e.map(function(e){var t=e[0],r=e[1];if(!Array.isArray(r))return m(t,r);return r.map(function(e){return m(t,e)}).join(";")}).join(";")}/**
 * Interpolate CSS selectors.
 */
function x(e,t){if(e.indexOf("&")>-1){return e.replace(a,t)}return t+" "+e}/**
 * Recursive loop building styles with deferred selectors.
 */
function T(e,t,r,i,s){var a=w(r,!!t),o=a.styleString,u=a.nestedStyles,f=a.isUnique;var h=o;if(t.charCodeAt(0)===64){var c=e.add(new A(t,s?undefined:o,e.hash));
// Nested styles support (e.g. `.foo > @media > .bar`).
if(o&&s){var l=c.add(new C(o,c.hash,f?"u"+(++n).toString(36):undefined));i.push([s,l])}for(var d=0,p=u;d<p.length;d++){var y=p[d],v=y[0],g=y[1];h+=v+T(c,v,g,i,s)}}else{var _=s?x(t,s):t;if(o){var l=e.add(new C(o,e.hash,f?"u"+(++n).toString(36):undefined));i.push([_,l])}for(var m=0,S=u;m<S.length;m++){var b=S[m],v=b[0],g=b[1];h+=v+T(e,v,g,i,_)}}return h}/**
 * Register all styles, but collect for selector interpolation using the hash.
 */
function I(e,r,n,i,s){var a=new k(e.hash);var o=[];var u=T(a,r,n,o);var f="f"+a.hash(u);var h=s?s+"_"+f:f;for(var c=0,l=o;c<l.length;c++){var d=l[c],p=d[0],y=d[1];var v=i?x(p,"."+t.escape(h)):p;y.add(new R(v,y.hash,undefined,u))}return{cache:a,pid:u,id:h}}/**
 * Cache to list to styles.
 */
function O(e){var t="";for(var r=0;r<e.length;r++)t+=e[r];return t}/**
 * Noop changes.
 */
var j={add:function(){return undefined},change:function(){return undefined},remove:function(){return undefined}};/**
 * Implement a cache/event emitter.
 */
var k=/** @class */function(){function e(e,t){if(e===void 0){e=_}if(t===void 0){t=j}this.hash=e;this.changes=t;this.sheet=[];this.changeId=0;this._keys=[];this._children=Object.create(null);this._counters=Object.create(null)}e.prototype.add=function(t){var r=this._counters[t.id]||0;var n=this._children[t.id]||t.clone();this._counters[t.id]=r+1;if(r===0){this._children[n.id]=n;this._keys.push(n.id);this.sheet.push(n.getStyles());this.changeId++;this.changes.add(n,this._keys.length-1)}else{
// Check if contents are different.
if(n.getIdentifier()!==t.getIdentifier()){throw new TypeError("Hash collision: "+t.getStyles()+" === "+n.getStyles())}var i=this._keys.indexOf(t.id);var s=this._keys.length-1;var a=this.changeId;if(i!==s){this._keys.splice(i,1);this._keys.push(t.id);this.changeId++}if(n instanceof e&&t instanceof e){var o=n.changeId;n.merge(t);if(n.changeId!==o){this.changeId++}}if(this.changeId!==a){if(i===s){this.sheet.splice(i,1,n.getStyles())}else{this.sheet.splice(i,1);this.sheet.splice(s,0,n.getStyles())}this.changes.change(n,i,s)}}return n};e.prototype.remove=function(t){var r=this._counters[t.id];if(r>0){this._counters[t.id]=r-1;var n=this._children[t.id];var i=this._keys.indexOf(n.id);if(r===1){delete this._counters[t.id];delete this._children[t.id];this._keys.splice(i,1);this.sheet.splice(i,1);this.changeId++;this.changes.remove(n,i)}else if(n instanceof e&&t instanceof e){var s=n.changeId;n.unmerge(t);if(n.changeId!==s){this.sheet.splice(i,1,n.getStyles());this.changeId++;this.changes.change(n,i,i)}}}};e.prototype.merge=function(e){for(var t=0,r=e._keys;t<r.length;t++){var n=r[t];this.add(e._children[n])}return this};e.prototype.unmerge=function(e){for(var t=0,r=e._keys;t<r.length;t++){var n=r[t];this.remove(e._children[n])}return this};e.prototype.clone=function(){return new e(this.hash).merge(this)};return e}();t.Cache=k;/**
 * Selector is a dumb class made to represent nested CSS selectors.
 */
var R=/** @class */function(){function e(e,t,r,n){if(r===void 0){r="s"+t(e)}if(n===void 0){n=""}this.selector=e;this.hash=t;this.id=r;this.pid=n}e.prototype.getStyles=function(){return this.selector};e.prototype.getIdentifier=function(){return this.pid+"."+this.selector};e.prototype.clone=function(){return new e(this.selector,this.hash,this.id,this.pid)};return e}();t.Selector=R;/**
 * The style container registers a style string with selectors.
 */
var C=/** @class */function(e){r(t,e);function t(t,r,n){if(n===void 0){n="c"+r(t)}var i=e.call(this,r)||this;i.style=t;i.hash=r;i.id=n;return i}t.prototype.getStyles=function(){return this.sheet.join(",")+"{"+this.style+"}"};t.prototype.getIdentifier=function(){return this.style};t.prototype.clone=function(){return new t(this.style,this.hash,this.id).merge(this)};return t}(k);t.Style=C;/**
 * Implement rule logic for style output.
 */
var A=/** @class */function(e){r(t,e);function t(t,r,n,i,s){if(r===void 0){r=""}if(i===void 0){i="a"+n(t+"."+r)}if(s===void 0){s=""}var a=e.call(this,n)||this;a.rule=t;a.style=r;a.hash=n;a.id=i;a.pid=s;return a}t.prototype.getStyles=function(){return this.rule+"{"+this.style+O(this.sheet)+"}"};t.prototype.getIdentifier=function(){return this.pid+"."+this.rule+"."+this.style};t.prototype.clone=function(){return new t(this.rule,this.style,this.hash,this.id,this.pid).merge(this)};return t}(k);t.Rule=A;/**
 * The FreeStyle class implements the API for everything else.
 */
var N=/** @class */function(i){r(s,i);function s(t,r,s,a){if(t===void 0){t=_}if(r===void 0){r=typeof e!=="undefined"&&e.env["NODE_ENV"]!=="production"}if(s===void 0){s="f"+(++n).toString(36)}var o=i.call(this,t,a)||this;o.hash=t;o.debug=r;o.id=s;return o}s.prototype.registerStyle=function(e,t){var r=this.debug?t:undefined;var n=I(this,"&",e,true,r),i=n.cache,s=n.id;this.merge(i);return s};s.prototype.registerKeyframes=function(e,t){return this.registerHashRule("@keyframes",e,t)};s.prototype.registerHashRule=function(e,r,n){var i=this.debug?n:undefined;var s=I(this,"",r,false,i),a=s.cache,o=s.pid,u=s.id;var f=new A(e+" "+t.escape(u),undefined,this.hash,undefined,o);this.add(f.merge(a));return u};s.prototype.registerRule=function(e,t){this.merge(I(this,e,t,false).cache)};s.prototype.registerCss=function(e){this.merge(I(this,"",e,false).cache)};s.prototype.getStyles=function(){return O(this.sheet)};s.prototype.getIdentifier=function(){return this.id};s.prototype.clone=function(){return new s(this.hash,this.debug,this.id,this.changes).merge(this)};return s}(k);t.FreeStyle=N;/**
 * Exports a simple function to create a new instance.
 */
function U(e,t,r){return new N(e,t,undefined,r)}t.create=U}).call(t,r(4))},/* 1 */
/***/
function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:true});/** Raf for node + browser */
t.raf=typeof requestAnimationFrame==="undefined"?function(e){return setTimeout(e)}:typeof window==="undefined"?requestAnimationFrame:requestAnimationFrame.bind(window);/**
 * Utility to join classes conditionally
 */
function n(){var e=[];for(var t=0;t<arguments.length;t++){e[t]=arguments[t]}return e.filter(function(e){return!!e}).join(" ")}t.classes=n;/**
 * Merges various styles into a single style object.
 * Note: if two objects have the same property the last one wins
 */
function i(){var e=[];for(var t=0;t<arguments.length;t++){e[t]=arguments[t]}/** The final result we will return */
var r={};for(var n=0,s=e;n<s.length;n++){var a=s[n];if(a==null||a===false){continue}for(var o in a){/** Falsy values except a explicit 0 is ignored */
var u=a[o];if(!u&&u!==0){continue}/** if nested media or pseudo selector */
if(o==="$nest"&&u){r[o]=r["$nest"]?i(r["$nest"],u):u}else if(o.indexOf("&")!==-1||o.indexOf("@media")===0){r[o]=r[o]?i(r[o],u):u}else{r[o]=u}}}return r}t.extend=i;/**
 * Utility to help customize styles with media queries. e.g.
 * ```
 * style(
 *  media({maxWidth:500}, {color:'red'})
 * )
 * ```
 */
t.media=function(e){var t=[];for(var r=1;r<arguments.length;r++){t[r-1]=arguments[r]}var n=[];if(e.type)n.push(e.type);if(e.orientation)n.push("(orientation: "+e.orientation+")");if(e.minWidth)n.push("(min-width: "+s(e.minWidth)+")");if(e.maxWidth)n.push("(max-width: "+s(e.maxWidth)+")");if(e.minHeight)n.push("(min-height: "+s(e.minHeight)+")");if(e.maxHeight)n.push("(max-height: "+s(e.maxHeight)+")");var a="@media "+n.join(" and ");var o={$nest:(u={},u[a]=i.apply(void 0,t),u)};return o;var u};var s=function(e){return typeof e==="string"?e:e+"px"}},/* 2 */
/***/
function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:true});var n=r(3);t.TypeStyle=n.TypeStyle;/**
 * All the CSS types in the 'types' namespace
 */
var i=r(6);t.types=i;/**
 * Export certain utilities
 */
var s=r(1);t.extend=s.extend;t.classes=s.classes;t.media=s.media;/** Zero configuration, default instance of TypeStyle */
var a=new n.TypeStyle({autoGenerateTag:true});/** Sets the target tag where we write the css on style updates */
t.setStylesTarget=a.setStylesTarget;/**
 * Insert `raw` CSS as a string. This is useful for e.g.
 * - third party CSS that you are customizing with template strings
 * - generating raw CSS in JavaScript
 * - reset libraries like normalize.css that you can use without loaders
 */
t.cssRaw=a.cssRaw;/**
 * Takes CSSProperties and registers it to a global selector (body, html, etc.)
 */
t.cssRule=a.cssRule;/**
 * Renders styles to the singleton tag imediately
 * NOTE: You should only call it on initial render to prevent any non CSS flash.
 * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
 **/
t.forceRenderStyles=a.forceRenderStyles;/**
 * Utility function to register an @font-face
 */
t.fontFace=a.fontFace;/**
 * Allows use to use the stylesheet in a node.js environment
 */
t.getStyles=a.getStyles;/**
 * Takes keyframes and returns a generated animationName
 */
t.keyframes=a.keyframes;/**
 * Helps with testing. Reinitializes FreeStyle + raw
 */
t.reinit=a.reinit;/**
 * Takes CSSProperties and return a generated className you can use on your component
 */
t.style=a.style;/**
 * Takes an object where property names are ideal class names and property values are CSSProperties, and
 * returns an object where property names are the same ideal class names and the property values are
 * the actual generated class names using the ideal class name as the $debugName
 */
t.stylesheet=a.stylesheet;/**
 * Creates a new instance of TypeStyle separate from the default instance.
 *
 * - Use this for creating a different typestyle instance for a shadow dom component.
 * - Use this if you don't want an auto tag generated and you just want to collect the CSS.
 *
 * NOTE: styles aren't shared between different instances.
 */
function o(e){var t=new n.TypeStyle({autoGenerateTag:false});if(e){t.setStylesTarget(e)}return t}t.createTypeStyle=o},/* 3 */
/***/
function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:true});var n=r(0);var i=r(5);var s=r(1);/**
 * Creates an instance of free style with our options
 */
var a=function(){/** Use the default hash function */ /** Preserve $debugName values */return n.create(undefined,true)};/**
 * Maintains a single stylesheet and keeps it in sync with requested styles
 */
var o=/** @class */function(){function e(e){var t=e.autoGenerateTag;var r=this;/**
         * Insert `raw` CSS as a string. This is useful for e.g.
         * - third party CSS that you are customizing with template strings
         * - generating raw CSS in JavaScript
         * - reset libraries like normalize.css that you can use without loaders
         */
this.cssRaw=function(e){if(!e){return}r._raw+=e||"";r._pendingRawChange=true;r._styleUpdated()};/**
         * Takes CSSProperties and registers it to a global selector (body, html, etc.)
         */
this.cssRule=function(e){var t=[];for(var n=1;n<arguments.length;n++){t[n-1]=arguments[n]}var a=i.ensureStringObj(s.extend.apply(void 0,t)).result;r._freeStyle.registerRule(e,a);r._styleUpdated();return};/**
         * Renders styles to the singleton tag imediately
         * NOTE: You should only call it on initial render to prevent any non CSS flash.
         * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
         **/
this.forceRenderStyles=function(){var e=r._getTag();if(!e){return}e.textContent=r.getStyles()};/**
         * Utility function to register an @font-face
         */
this.fontFace=function(){var e=[];for(var t=0;t<arguments.length;t++){e[t]=arguments[t]}var n=r._freeStyle;for(var i=0,s=e;i<s.length;i++){var a=s[i];n.registerRule("@font-face",a)}r._styleUpdated();return};/**
         * Allows use to use the stylesheet in a node.js environment
         */
this.getStyles=function(){return(r._raw||"")+r._freeStyle.getStyles()};/**
         * Takes keyframes and returns a generated animationName
         */
this.keyframes=function(e){var t=i.explodeKeyframes(e),n=t.keyframes,s=t.$debugName;
// TODO: replace $debugName with display name
var a=r._freeStyle.registerKeyframes(n,s);r._styleUpdated();return a};/**
         * Helps with testing. Reinitializes FreeStyle + raw
         */
this.reinit=function(){/** reinit freestyle */
var e=a();r._freeStyle=e;r._lastFreeStyleChangeId=e.changeId;/** reinit raw */
r._raw="";r._pendingRawChange=false;/** Clear any styles that were flushed */
var t=r._getTag();if(t){t.textContent=""}};/** Sets the target tag where we write the css on style updates */
this.setStylesTarget=function(e){/** Clear any data in any previous tag */
if(r._tag){r._tag.textContent=""}r._tag=e;/** This special time buffer immediately */
r.forceRenderStyles()};/**
         * Takes an object where property names are ideal class names and property values are CSSProperties, and
         * returns an object where property names are the same ideal class names and the property values are
         * the actual generated class names using the ideal class name as the $debugName
         */
this.stylesheet=function(e){var t=Object.getOwnPropertyNames(e);var n={};for(var i=0,s=t;i<s.length;i++){var a=s[i];var o=e[a];if(o){o.$debugName=a;n[a]=r.style(o)}}return n};var n=a();this._autoGenerateTag=t;this._freeStyle=n;this._lastFreeStyleChangeId=n.changeId;this._pending=0;this._pendingRawChange=false;this._raw="";this._tag=undefined;
// rebind prototype to TypeStyle.  It might be better to do a function() { return this.style.apply(this, arguments)}
this.style=this.style.bind(this)}/**
     * Only calls cb all sync operations settle
     */
e.prototype._afterAllSync=function(e){var t=this;this._pending++;var r=this._pending;s.raf(function(){if(r!==t._pending){return}e()})};e.prototype._getTag=function(){if(this._tag){return this._tag}if(this._autoGenerateTag){var e=typeof window==="undefined"?{textContent:""}:document.createElement("style");if(typeof document!=="undefined"){document.head.appendChild(e)}this._tag=e;return e}return undefined};/** Checks if the style tag needs updating and if so queues up the change */
e.prototype._styleUpdated=function(){var e=this;var t=this._freeStyle.changeId;var r=this._lastFreeStyleChangeId;if(!this._pendingRawChange&&t===r){return}this._lastFreeStyleChangeId=t;this._pendingRawChange=false;this._afterAllSync(function(){return e.forceRenderStyles()})};e.prototype.style=function(){var e=this._freeStyle;var t=i.ensureStringObj(s.extend.apply(undefined,arguments)),r=t.result,n=t.debugName;var a=n?e.registerStyle(r,n):e.registerStyle(r);this._styleUpdated();return a};return e}();t.TypeStyle=o},/* 4 */
/***/
function(e,t){
// shim for using process in browser
var r=e.exports={};
// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.
var n;var i;function s(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}(function(){try{if(typeof setTimeout==="function"){n=setTimeout}else{n=s}}catch(e){n=s}try{if(typeof clearTimeout==="function"){i=clearTimeout}else{i=a}}catch(e){i=a}})();function o(e){if(n===setTimeout){
//normal enviroments in sane situations
return setTimeout(e,0)}
// if setTimeout wasn't available but was latter defined
if((n===s||!n)&&setTimeout){n=setTimeout;return setTimeout(e,0)}try{
// when when somebody has screwed with setTimeout but no I.E. maddness
return n(e,0)}catch(t){try{
// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
return n.call(null,e,0)}catch(t){
// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
return n.call(this,e,0)}}}function u(e){if(i===clearTimeout){
//normal enviroments in sane situations
return clearTimeout(e)}
// if clearTimeout wasn't available but was latter defined
if((i===a||!i)&&clearTimeout){i=clearTimeout;return clearTimeout(e)}try{
// when when somebody has screwed with setTimeout but no I.E. maddness
return i(e)}catch(t){try{
// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
return i.call(null,e)}catch(t){
// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
// Some versions of I.E. have different rules for clearTimeout vs setTimeout
return i.call(this,e)}}}var f=[];var h=false;var c;var l=-1;function d(){if(!h||!c){return}h=false;if(c.length){f=c.concat(f)}else{l=-1}if(f.length){p()}}function p(){if(h){return}var e=o(d);h=true;var t=f.length;while(t){c=f;f=[];while(++l<t){if(c){c[l].run()}}l=-1;t=f.length}c=null;h=false;u(e)}r.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1){for(var r=1;r<arguments.length;r++){t[r-1]=arguments[r]}}f.push(new y(e,t));if(f.length===1&&!h){o(p)}};
// v8 likes predictible objects
function y(e,t){this.fun=e;this.array=t}y.prototype.run=function(){this.fun.apply(null,this.array)};r.title="browser";r.browser=true;r.env={};r.argv=[];r.version="";// empty string to avoid regexp issues
r.versions={};function v(){}r.on=v;r.addListener=v;r.once=v;r.off=v;r.removeListener=v;r.removeAllListeners=v;r.emit=v;r.prependListener=v;r.prependOnceListener=v;r.listeners=function(e){return[]};r.binding=function(e){throw new Error("process.binding is not supported")};r.cwd=function(){return"/"};r.chdir=function(e){throw new Error("process.chdir is not supported")};r.umask=function(){return 0}},/* 5 */
/***/
function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:true});var n=r(0);/**
 * We need to do the following to *our* objects before passing to freestyle:
 * - For any `$nest` directive move up to FreeStyle style nesting
 * - For any `$unique` directive map to FreeStyle Unique
 * - For any `$debugName` directive return the debug name
 */
function i(e){/** The final result we will return */
var t={};var r="";for(var s in e){/** Grab the value upfront */
var a=e[s];/** TypeStyle configuration options */
if(s==="$unique"){t[n.IS_UNIQUE]=a}else if(s==="$nest"){var o=a;for(var u in o){var f=o[u];t[u]=i(f).result}}else if(s==="$debugName"){r=a}else{t[s]=a}}return{result:t,debugName:r}}t.ensureStringObj=i;
// todo: better name here
function s(e){var t={$debugName:undefined,keyframes:{}};for(var r in e){var n=e[r];if(r==="$debugName"){t.$debugName=n}else{t.keyframes[r]=n}}return t}t.explodeKeyframes=s},/* 6 */
/***/
function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:true})}])});