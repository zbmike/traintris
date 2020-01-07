/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _styles_index_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles/index.scss */ "./src/styles/index.scss");
/* harmony import */ var _styles_index_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_styles_index_scss__WEBPACK_IMPORTED_MODULE_0__);


var tetrominoes = __webpack_require__(/*! ./tetromino */ "./src/tetromino.js");

var arenaWidth = 12;
var arenaHeight = 20;
window.addEventListener("DOMContentLoaded", function () {
  var canvas = document.getElementById('canvas');
  canvas.width = 480;
  canvas.height = 800;
  var ctx = canvas.getContext('2d');
  ctx.scale(40, 40);
  var piece = tetrominoes.t2;
  var currentPosition = {
    x: 5,
    y: 0
  };
  render(piece, currentPosition, ctx);
});

function render(piece, currentPosition, ctx) {
  renderFrame(piece, currentPosition, ctx);
  requestAnimationFrame(render);
}

function renderFrame(piece, currentPosition, ctx) {
  console.log(ctx);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  drawTetromino(piece, currentPosition, ctx);
}

function drawTetromino(piece, offset, ctx) {
  piece.forEach(function (row, y) {
    row.forEach(function (value, x) {
      if (value) {
        ctx.fillStyle = 'green';
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

/***/ }),

/***/ "./src/styles/index.scss":
/*!*******************************!*\
  !*** ./src/styles/index.scss ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/tetromino.js":
/*!**************************!*\
  !*** ./src/tetromino.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

var t1 = [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
var t2 = [[0, 1, 0], [0, 1, 1], [0, 1, 0]];
var t3 = [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
var t4 = [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
module.exports = {
  t1: t1,
  t2: t2,
  t3: t3,
  t4: t4
};

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9zdHlsZXMvaW5kZXguc2NzcyIsIndlYnBhY2s6Ly8vLi9zcmMvdGV0cm9taW5vLmpzIl0sIm5hbWVzIjpbInRldHJvbWlub2VzIiwicmVxdWlyZSIsImFyZW5hV2lkdGgiLCJhcmVuYUhlaWdodCIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJjYW52YXMiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwid2lkdGgiLCJoZWlnaHQiLCJjdHgiLCJnZXRDb250ZXh0Iiwic2NhbGUiLCJwaWVjZSIsInQyIiwiY3VycmVudFBvc2l0aW9uIiwieCIsInkiLCJyZW5kZXIiLCJyZW5kZXJGcmFtZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImNvbnNvbGUiLCJsb2ciLCJmaWxsU3R5bGUiLCJmaWxsUmVjdCIsImRyYXdUZXRyb21pbm8iLCJvZmZzZXQiLCJmb3JFYWNoIiwicm93IiwidmFsdWUiLCJ0MSIsInQzIiwidDQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztR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LElBQU1pQixFQUFFLEdBQUcsQ0FDUCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQURPLEVBRVAsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FGTyxFQUdQLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBSE8sQ0FBWDtBQU1BLElBQU1DLEVBQUUsR0FBRyxDQUNQLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRE8sRUFFUCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUZPLEVBR1AsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FITyxDQUFYO0FBTUFDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQjtBQUFDSixJQUFFLEVBQUZBLEVBQUQ7QUFBS2hCLElBQUUsRUFBRkEsRUFBTDtBQUFTaUIsSUFBRSxFQUFGQSxFQUFUO0FBQWFDLElBQUUsRUFBRkE7QUFBYixDQUFqQixDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9kaXN0L1wiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsImltcG9ydCBcIi4vc3R5bGVzL2luZGV4LnNjc3NcIjtcbmNvbnN0IHRldHJvbWlub2VzID0gcmVxdWlyZSgnLi90ZXRyb21pbm8nKTtcblxuY29uc3QgYXJlbmFXaWR0aCA9IDEyO1xuY29uc3QgYXJlbmFIZWlnaHQgPSAyMDtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuICBjYW52YXMud2lkdGggPSA0ODA7XG4gIGNhbnZhcy5oZWlnaHQgPSA4MDA7XG4gIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBjdHguc2NhbGUoNDAsIDQwKTtcblxuICBsZXQgcGllY2UgPSB0ZXRyb21pbm9lcy50MjtcblxuICBsZXQgY3VycmVudFBvc2l0aW9uID0geyB4OiA1LCB5OiAwIH07XG4gIFxuICByZW5kZXIocGllY2UsIGN1cnJlbnRQb3NpdGlvbiwgY3R4KTtcbn0pO1xuXG5mdW5jdGlvbiByZW5kZXIocGllY2UsIGN1cnJlbnRQb3NpdGlvbiwgY3R4KSB7XG4gIHJlbmRlckZyYW1lKHBpZWNlLCBjdXJyZW50UG9zaXRpb24sIGN0eCk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJGcmFtZShwaWVjZSwgY3VycmVudFBvc2l0aW9uLCBjdHgpIHtcbiAgY29uc29sZS5sb2coY3R4KTtcbiAgY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gIGN0eC5maWxsUmVjdCgwLCAwLCBhcmVuYVdpZHRoLCBhcmVuYUhlaWdodCk7XG4gIFxuICBkcmF3VGV0cm9taW5vKHBpZWNlLCBjdXJyZW50UG9zaXRpb24sIGN0eCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUZXRyb21pbm8ocGllY2UsIG9mZnNldCwgY3R4KXtcbiAgcGllY2UuZm9yRWFjaCgocm93LCB5KSA9PiB7XG4gICAgcm93LmZvckVhY2goKHZhbHVlLCB4KSA9PiB7XG4gICAgICBpZiAodmFsdWUpe1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2dyZWVuJztcbiAgICAgICAgY3R4LmZpbGxSZWN0KHggKyBvZmZzZXQueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICB5ICsgb2Zmc2V0LnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgMSwgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpbiIsImNvbnN0IHQxID0gW1xuICAgIFswLCAwLCAwXSxcbiAgICBbMSwgMSwgMV0sXG4gICAgWzAsIDEsIDBdXG5dXG5cbmNvbnN0IHQyID0gW1xuICAgIFswLCAxLCAwXSxcbiAgICBbMCwgMSwgMV0sXG4gICAgWzAsIDEsIDBdXG5dXG5cbmNvbnN0IHQzID0gW1xuICAgIFswLCAxLCAwXSxcbiAgICBbMSwgMSwgMV0sXG4gICAgWzAsIDAsIDBdXG5dXG5cbmNvbnN0IHQ0ID0gW1xuICAgIFswLCAwLCAwXSxcbiAgICBbMSwgMSwgMV0sXG4gICAgWzAsIDEsIDBdXG5dXG5cbm1vZHVsZS5leHBvcnRzID0ge3QxLCB0MiwgdDMsIHQ0fTsiXSwic291cmNlUm9vdCI6IiJ9