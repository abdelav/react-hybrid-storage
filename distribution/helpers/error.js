'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpiredError = exports.NotFoundError = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NotFoundError = exports.NotFoundError = function NotFoundError(message) {
  (0, _classCallCheck3.default)(this, NotFoundError);

  this.name = 'NotFoundError';
  this.message = 'Not Found! Params: ' + message;
  this.stack = new Error().stack; // Optional
};

var ExpiredError = exports.ExpiredError = function ExpiredError(message) {
  (0, _classCallCheck3.default)(this, ExpiredError);

  this.name = 'ExpiredError';
  this.message = 'Expired! Params: ' + message;
  this.stack = new Error().stack; // Optional
};