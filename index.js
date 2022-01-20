import OTP, { defaultParams } from './lib/OTP';
import { formatURI, parseURI, importSecret, exportSecret } from './lib/utils';

/**
 * @typedef TOTPSpecificParams
 * @property {number} period
 */

/**
 * @typedef HOTPSpecificParams
 * @property {number} counter
 */

/**
 * @typedef {import('./lib/OTP').OTPParams & TOTPSpecificParams} TOTPParams
 */
/**
 * @typedef {import('./lib/OTP').OTPParams & HOTPSpecificParams} HOTPParams
 */

/**
 * @class
 */
export class TOTP extends OTP {
  get type() { return 'totp'; }

  /** @type {TOTPParams} */
  get params() {
    return this._params || {...defaultParams(), period: 30};
  }
  set params(params) {
    super.params = params;
  }

  get() {
    return { ...super.get(), timeout: this.getTimeout() };
  }

  /**
   * Returns time in seconds for new code
   * @returns {number}
   */
  getTimeout() {
    return this.params.period - Math.floor(Date.now() / 1000) % this.params.period;
  }

  /**
   * @private
   * @override
   * @returns {number}
   */
  _getOtp() {
    return Math.floor((Date.now() / 1000) / this.params.period);
  }
}


/**
 * @class
 */
export class HOTP extends OTP {
  get type() { return 'hotp'; }

  /** @type {HOTPParams} */
  get params() {
    return this._params || {...defaultParams(), counter: 0};
  }
  set params(params) {
    super.params = params;
  }

  get counter() {
    return this.params.counter;
  }

  get() {
    return { ...super.get(), counter: this.counter };
  }

  evalCounter() {
    return ++this.params.counter;
  }

  /**
   * @private
   * @override
   * @returns {number}
   */
  _getOtp() {
    return this.evalCounter();
  }
}

/**
 * Create OTP class instance by given URI or params
 * @param {string|TOTPParams|HOTPParams} uri
 * @returns {HOTP|TOTP}
 */
export const createOTP = uri => {
  /** @type {OTPParams} */
  const params = typeof uri === 'string' ? parseURI(uri) : uri;

  if (params.type === 'totp') {
    return new TOTP(params);
  } else if (params.type === 'hotp') {
    return new HOTP(params);
  } else {
    return null;
  }
};

export { formatURI, parseURI, importSecret, exportSecret };


