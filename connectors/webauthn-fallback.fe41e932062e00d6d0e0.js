!function(e){var t={};function n(r){if(t[r])return t[r].exports;var a=t[r]={i:r,l:!1,exports:{}};return e[r].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(r,a,function(t){return e[t]}.bind(null,a));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1332)}({1332:function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(a,o){function i(e){try{u(r.next(e))}catch(t){o(t)}}function c(e){try{u(r.throw(e))}catch(t){o(t)}}function u(e){var t;e.done?a(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(i,c)}u((r=r.apply(e,t||[])).next())}))},a=this&&this.__generator||function(e,t){var n,r,a,o,i={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return o={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function c(o){return function(c){return function(o){if(n)throw new TypeError("Generator is already executing.");for(;i;)try{if(n=1,r&&(a=2&o[0]?r.return:o[0]?r.throw||((a=r.return)&&a.call(r),0):r.next)&&!(a=a.call(r,o[1])).done)return a;switch(r=0,a&&(o=[2&o[0],a.value]),o[0]){case 0:case 1:a=o;break;case 4:return i.label++,{value:o[1],done:!1};case 5:i.label++,r=o[1],o=[0];continue;case 7:o=i.ops.pop(),i.trys.pop();continue;default:if(!(a=i.trys,(a=a.length>0&&a[a.length-1])||6!==o[0]&&2!==o[0])){i=0;continue}if(3===o[0]&&(!a||o[1]>a[0]&&o[1]<a[3])){i.label=o[1];break}if(6===o[0]&&i.label<a[1]){i.label=a[1],a=o;break}if(a&&i.label<a[2]){i.label=a[2],i.ops.push(o);break}a[2]&&i.ops.pop(),i.trys.pop();continue}o=t.call(e,i)}catch(c){o=[6,c],r=0}finally{n=a=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,c])}}};Object.defineProperty(t,"__esModule",{value:!0});var o=n(162),i=n(440);n(441);var c,u=!1,s=null,l=!1,d="en",f={};function p(){u||((s=o.getQsParam("parent"))?(s=decodeURIComponent(s),new URL(s).origin,d=o.getQsParam("locale").replace("-","_"),"1"===o.getQsParam("v")?function(){var e=o.getQsParam("data");if(!e)return void y("No data.");c=o.b64Decode(e)}():function(){var e=null;try{e=JSON.parse(o.b64Decode(o.getQsParam("data")))}catch(t){return void y("Cannot parse data.")}c=e.data}(),u=!0):y("No parent."))}function b(e){return r(this,void 0,void 0,(function(){return a(this,(function(t){switch(t.label){case 0:return[4,fetch("locales/"+e+"/messages.json?cache=72rdf")];case 1:return[4,t.sent().json()];case 2:return[2,t.sent()]}}))}))}function g(e){var t;return(null===(t=f[e])||void 0===t?void 0:t.message)||""}function m(){if(!l)if("credentials"in navigator)if(p(),c){var e;try{e=i.parseWebauthnJson(c)}catch(t){return void y("Cannot parse data.")}!function(e){r(this,void 0,void 0,(function(){var t,n,r;return a(this,(function(a){switch(a.label){case 0:return a.trys.push([0,2,,3]),[4,navigator.credentials.get({publicKey:e})];case 1:return t=a.sent(),l?[2]:(n=i.buildDataString(t),r=document.getElementById("remember").checked,window.postMessage({command:"webAuthnResult",data:n,remember:r},"*"),l=!0,function(e){document.getElementById("webauthn-button").disabled=!0;var t=document.getElementById("msg");h(t),t.textContent=e,t.classList.add("alert"),t.classList.add("alert-success")}(g("webAuthnSuccess")),[3,3]);case 2:return y(a.sent()),[3,3];case 3:return[2]}}))}))}(e)}else y("No data.");else y(g("webAuthnNotSupported"))}function y(e){var t=document.getElementById("msg");h(t),t.textContent=e,t.classList.add("alert"),t.classList.add("alert-danger")}function h(e){e.classList.remove("alert"),e.classList.remove("alert-danger"),e.classList.remove("alert-success")}document.addEventListener("DOMContentLoaded",(function(){return r(void 0,void 0,void 0,(function(){var e,t;return a(this,(function(n){switch(n.label){case 0:p(),n.label=1;case 1:return n.trys.push([1,3,,5]),[4,b(d)];case 2:return f=n.sent(),[3,5];case 3:return n.sent(),console.error("Failed to load the locale",d),[4,b("en")];case 4:return f=n.sent(),[3,5];case 5:return document.getElementById("msg").innerText=g("webAuthnFallbackMsg"),document.getElementById("remember-label").innerText=g("rememberMe"),(e=document.getElementById("webauthn-button")).innerText=g("webAuthnAuthenticate"),e.onclick=m,document.getElementById("spinner").classList.add("d-none"),(t=document.getElementById("content")).classList.add("d-block"),t.classList.remove("d-none"),[2]}}))}))}))},162:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.b64Decode=t.getQsParam=void 0,t.getQsParam=function(e){var t=window.location.href;e=e.replace(/[\[\]]/g,"\\$&");var n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null},t.b64Decode=function(e){return decodeURIComponent(Array.prototype.map.call(atob(e),(function(e){return"%"+("00"+e.charCodeAt(0).toString(16)).slice(-2)})).join(""))}},440:function(e,t,n){"use strict";function r(e){if(Array.isArray(e)&&(e=Uint8Array.from(e)),e instanceof ArrayBuffer&&(e=new Uint8Array(e)),e instanceof Uint8Array){for(var t="",n=e.byteLength,r=0;r<n;r++)t+=String.fromCharCode(e[r]);e=window.btoa(t)}if("string"!=typeof e)throw new Error("could not coerce to string");return e=e.replace(/\+/g,"-").replace(/\//g,"_").replace(/=*$/g,"")}Object.defineProperty(t,"__esModule",{value:!0}),t.parseWebauthnJson=t.buildDataString=void 0,t.buildDataString=function(e){var t=e.response,n=new Uint8Array(t.authenticatorData),a=new Uint8Array(t.clientDataJSON),o=new Uint8Array(e.rawId),i=new Uint8Array(t.signature),c={id:e.id,rawId:r(o),type:e.type,extensions:e.getClientExtensionResults(),response:{authenticatorData:r(n),clientDataJson:r(a),signature:r(i)}};return JSON.stringify(c)},t.parseWebauthnJson=function(e){var t=JSON.parse(e),n=t.challenge.replace(/-/g,"+").replace(/_/g,"/");return t.challenge=Uint8Array.from(atob(n),(function(e){return e.charCodeAt(0)})),t.allowCredentials.forEach((function(e){var t=e.id.replace(/\_/g,"/").replace(/\-/g,"+");e.id=Uint8Array.from(atob(t),(function(e){return e.charCodeAt(0)}))})),t}},441:function(e,t,n){"use strict";n.r(t)}});
//# sourceMappingURL=webauthn-fallback.fe41e932062e00d6d0e0.js.map