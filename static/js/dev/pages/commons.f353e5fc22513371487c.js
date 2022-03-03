/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkwoodgury_group_website"] = self["webpackChunkwoodgury_group_website"] || []).push([["commons"],{

/***/ "./src/js/pages/app.js":
/*!*****************************!*\
  !*** ./src/js/pages/app.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _utils_bootstrap___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/bootstrap/ */ \"./src/js/utils/bootstrap/index.js\");\n/**\r\n * Copyright 2022 Select Interactive, LLC. All rights reserved.\r\n * @author: The Select Interactive dev team (www.select-interactive.com)\r\n */\r\n\r\n\r\n// Expose toast and alert to entire app with import here\r\n// import toast from '../components/toast';\r\n// import alert from '../components/alert';\r\n\r\nclass App extends _utils_bootstrap___WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\r\n    constructor() {\r\n        super();\r\n\r\n        // Expose the imported toast and alert element to app\r\n        // this.toast = toast;\r\n        // this.alert = alert;\r\n    }\r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new App());\n\n//# sourceURL=webpack://woodgury-group-website/./src/js/pages/app.js?");

/***/ }),

/***/ "./src/js/utils/bootstrap/index.js":
/*!*****************************************!*\
  !*** ./src/js/utils/bootstrap/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Bootstrap)\n/* harmony export */ });\n/* harmony import */ var _fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../fetch */ \"./src/js/utils/fetch/index.js\");\n/* harmony import */ var _fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_fetch__WEBPACK_IMPORTED_MODULE_0__);\n/**\r\n * Copyright 2022 Select Interactive, LLC. All rights reserved.\r\n * @author: The Select Interactive dev team (www.select-interactive.com)\r\n * Feb 2022: Remove polyfills for promise, fetch, and array as IE 11 support dropped.\r\n */\r\n\r\n\r\nclass Bootstrap {\r\n    constructor() { }\r\n\r\n    init() {\r\n        return new Promise( ( resolve ) => {\r\n            requestAnimationFrame( async () => {\r\n                document.body.classList.add( 'page-is-animatable' );\r\n                resolve();\r\n            } );\r\n        } );\r\n    }\r\n}\n\n//# sourceURL=webpack://woodgury-group-website/./src/js/utils/bootstrap/index.js?");

/***/ }),

/***/ "./src/js/utils/fetch/index.js":
/*!*************************************!*\
  !*** ./src/js/utils/fetch/index.js ***!
  \*************************************/
/***/ (() => {

eval("/**\r\n* Copyright 2022 Select Interactive, LLC. All rights reserved.\r\n* @author: The Select Interactive dev team (www.select-interactive.com)\r\n*/\r\nconst STATUS_CODES = {\r\n    OK: 200\r\n};\r\n\r\nif ( !self.fetch ) {\r\n    console.warn( 'Fetch has not been polyfilled.' );\r\n}\r\n\r\n( () => {\r\n    const doFetch = self.fetch;\r\n\r\n    self.fetch = ( url, options ) => {\r\n        // @ts-ignore\r\n        if ( typeof url !== 'string' ) {\r\n            return doFetch( url, options );\r\n        }\r\n\r\n        return new Promise( async ( resolve, reject ) => {\r\n            try {\r\n                const rsp = await doFetch( url, options );\r\n\r\n                if ( rsp.status === STATUS_CODES.OK ) {\r\n                    const result = await parseJSON( rsp );\r\n\r\n                    if ( result.ok ) {\r\n                        return resolve( result.data );\r\n                    }\r\n                    else {\r\n                        return reject( result );\r\n                    }\r\n                }\r\n                else {\r\n                    return reject( {\r\n                        message: await rsp.text(),\r\n                        status: rsp.status\r\n                    } );\r\n                }\r\n            }\r\n            catch ( e ) {\r\n                return reject( e );\r\n            }\r\n        } );\r\n    };\r\n} )();\r\n\r\nfunction parseJSON( rsp ) {\r\n    return new Promise( async ( resolve, reject ) => {\r\n        try {\r\n            const result = await rsp.json();\r\n\r\n            resolve( {\r\n                status: result.status,\r\n                ok: rsp.ok,\r\n                data: result.data,\r\n                message: result.message || ''\r\n            } );\r\n        }\r\n        catch ( e ) {\r\n            reject( e );\r\n        }\r\n    } );\r\n}\n\n//# sourceURL=webpack://woodgury-group-website/./src/js/utils/fetch/index.js?");

/***/ })

}]);