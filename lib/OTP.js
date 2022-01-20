import crypto from 'crypto';
import { intToBuffer, trunc, padLeft, formatURI } from './utils';

/**
 * @typedef {Object} OTPParams
 * @property {'sha1'|'sha256'|'sha512'} algorithm
 * @property {6|8} digits
 * @property {Buffer} secret
 * @property {'totp'|'hotp'|null} type
 * @property {string?} issuer
 * @property {string?} account
 */

/**
 * @typedef {Object} OTPResult
 * @property {string} code
 * @property {'totp'|'hotp'} type
 * @property {string?} issuer
 * @property {string?} account
 */

/** @returns {OTPParams} */
export const defaultParams = () => ({
  algorithm: 'sha1',
  digits: 6,
  secret: null
});

/**
 * @class
 */
export default class OTP {
  constructor(params = {}) {
    this.params = { ...this.params, ...params };

    if (!this.params.secret)
      throw new Error('No secret key');

    if (!this.acceptedHashes.includes(this.params.algorithm))
      throw new Error('Unsupported algorithm');
  }

  get type() { return null; }

  /** @type {OTPParams} */
  get params() {
    return this._params || defaultParams();
  }
  set params(params) {
    this._params = { ...defaultParams(), ...params };
  }

  /** Supported hashes */
  get acceptedHashes() {
    return ['sha1', 'sha256', 'sha512'];
  }

  /**
   * Returns OTP code
   * @returns {string}
   */
  getCode() {
    const length = this.params.digits;
    const otp = intToBuffer(this._getOtp());

    const hmac = crypto.createHmac(this.params.algorithm, this.params.secret);
    const digest = hmac.update(otp).digest();

    return padLeft(
      trunc(digest, length),
      length, '0'
    );
  }

  /**
   * Returns OTP result
   * @returns {OTPResult}
   */
  get() {
    return {
      code: this.getCode(),
      type: this.params.type || this.type,
      issuer: this.params.issuer || null,
      account: this.params.account || null
    };
  }

  toString() {
    return formatURI({type: this.type, ...this.params});
  }

  /**
   * @private
   * @returns {number}
   */
  _getOtp() { return 0; }

}
