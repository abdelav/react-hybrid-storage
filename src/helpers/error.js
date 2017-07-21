// @flow

export class NotFoundError {
  name    : string;
  message : string;
  stack   : string;
  constructor (message : string) {
    this.name = 'NotFoundError';
    this.message = `Not Found! Params: ${message}`;
    this.stack = new Error().stack; // Optional
  }
}

export class ExpiredError {
  name    : string;
  message : string;
  stack   : string;
  constructor (message : string) {
    this.name = 'ExpiredError';
    this.message = `Expired! Params: ${message}`;
    this.stack = new Error().stack; // Optional
  }
}
