(()=>{"use strict";var e={90748:(e,t)=>{function n(e){if(Array.isArray(e)&&(e=Uint8Array.from(e)),e instanceof ArrayBuffer&&(e=new Uint8Array(e)),e instanceof Uint8Array){let t="";const n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);e=window.btoa(t)}if("string"!=typeof e)throw new Error("could not coerce to string");return e=e.replace(/\+/g,"-").replace(/\//g,"_").replace(/=*$/g,"")}Object.defineProperty(t,"__esModule",{value:!0}),t.parseWebauthnJson=t.buildDataString=void 0,t.buildDataString=function(e){const t=e.response,r=new Uint8Array(t.authenticatorData),o=new Uint8Array(t.clientDataJSON),a=new Uint8Array(e.rawId),i=new Uint8Array(t.signature),c={id:e.id,rawId:n(a),type:e.type,extensions:e.getClientExtensionResults(),response:{authenticatorData:n(r),clientDataJson:n(o),signature:n(i)}};return JSON.stringify(c)},t.parseWebauthnJson=function(e){const t=JSON.parse(e),n=t.challenge.replace(/-/g,"+").replace(/_/g,"/");return t.challenge=Uint8Array.from(atob(n),(e=>e.charCodeAt(0))),t.allowCredentials.forEach((e=>{const t=e.id.replace(/\_/g,"/").replace(/\-/g,"+");e.id=Uint8Array.from(atob(t),(e=>e.charCodeAt(0)))})),t}},4180:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.b64Decode=t.getQsParam=void 0,t.getQsParam=function(e){const t=window.location.href;e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null},t.b64Decode=function(e){return decodeURIComponent(Array.prototype.map.call(atob(e),(e=>"%"+("00"+e.charCodeAt(0).toString(16)).slice(-2))).join(""))}},50579:function(e,t,n){var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,a){function i(e){try{s(r.next(e))}catch(t){a(t)}}function c(e){try{s(r.throw(e))}catch(t){a(t)}}function s(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(i,c)}s((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const o=n(4180),a=n(90748);n(48672);let i,c=!1,s=null,d=null,l=!1,u="en",f={};function g(){if(c)return;if(s=o.getQsParam("parent"),!s)return void b("No parent.");s=decodeURIComponent(s),d=new URL(s).origin,u=o.getQsParam("locale").replace("-","_");"1"===o.getQsParam("v")?function(){const e=o.getQsParam("data");if(!e)return void b("No data.");i=o.b64Decode(e)}():function(){let e=null;try{e=JSON.parse(o.b64Decode(o.getQsParam("data")))}catch(t){return void b("Cannot parse data.")}i=e.data}(),c=!0}function m(e){return r(this,void 0,void 0,(function*(){const t=`locales/${e}/messages.json?cache=doiegc`,n=yield fetch(t);return yield n.json()}))}function y(e){var t;return(null===(t=f[e])||void 0===t?void 0:t.message)||""}function p(){if(l)return;if(!("credentials"in navigator))return void b(y("webAuthnNotSupported"));if(g(),!i)return void b("No data.");let e;try{e=a.parseWebauthnJson(i)}catch(t){return void b("Cannot parse data.")}!function(e){r(this,void 0,void 0,(function*(){try{const t=yield navigator.credentials.get({publicKey:e});if(l)return;const n=a.buildDataString(t),r=document.getElementById("remember").checked;window.postMessage({command:"webAuthnResult",data:n,remember:r},"*"),l=!0,function(e){document.getElementById("webauthn-button").disabled=!0;const t=document.getElementById("msg");h(t),t.textContent=e,t.classList.add("alert"),t.classList.add("alert-success")}(y("webAuthnSuccess"))}catch(t){b(t)}}))}(e)}function b(e){const t=document.getElementById("msg");h(t),t.textContent=e,t.classList.add("alert"),t.classList.add("alert-danger")}function h(e){e.classList.remove("alert"),e.classList.remove("alert-danger"),e.classList.remove("alert-success")}document.addEventListener("DOMContentLoaded",(()=>r(void 0,void 0,void 0,(function*(){g();try{f=yield m(u)}catch(n){console.error("Failed to load the locale",u),f=yield m("en")}document.getElementById("msg").innerText=y("webAuthnFallbackMsg"),document.getElementById("remember-label").innerText=y("rememberMe");const e=document.getElementById("webauthn-button");e.innerText=y("webAuthnAuthenticate"),e.onclick=p,document.getElementById("spinner").classList.add("d-none");const t=document.getElementById("content");t.classList.add("d-block"),t.classList.remove("d-none")}))))},48672:(e,t,n)=>{n.r(t)}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var a=t[r]={exports:{}};return e[r].call(a.exports,a,a.exports,n),a.exports}n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};n(50579)})();
//# sourceMappingURL=webauthn-fallback.0531a39df9edfe1fcf27.js.map