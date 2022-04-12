import base32 from 'thirty-two';

/**
 * @param {number} int
 * @returns {number[]}
 */
export const intToBuffer = (int, length = 8) => {
  const bytes = Array(length).fill(0);
  let i = length;

  while (i > 0) {
    bytes[i - 1] = int & (255);
    int = int >> 8;
    i--;
  }

  return Buffer.from(bytes);
};

export const trunc = (digest, length) => {
  const offset = digest[19] & 0xf;

  const val = (digest[offset] & 0x7f) << 24 |
      (digest[offset + 1] & 0xff) << 16 |
      (digest[offset + 2] & 0xff) << 8  |
      (digest[offset + 3] & 0xff);

  return (val % Math.pow(10, length)) + '';
};

export const padLeft = (str, length = 0, char = '0') => {
  return str.length >= length
    ? str
    : Array(length - str.length).fill(char).join('') + str;
};

/**
 *
 * @param {string} secret
 * @returns {Buffer}
 */
export const importSecret = secret => {
  return base32.decode(secret);
};

/**
 * @param {Buffer} secret
 * @returns {string}
 */
export const exportSecret = secret => {
  return base32.encode(secret).toString();
};

/**
 * Convert URI to params
 * @param {string} uri
 * @returns {import('../index').TOTPParams|import('../index').HOTPParams}
 */
export const parseURI = uri => {
  const parsed = new URL(uri);

  if (parsed.protocol.toLowerCase() !== 'otpauth:') return null;

  const type = parsed.hostname.toLowerCase();
  if (!['totp', 'hotp'].includes(type)) return null;

  const search = Object.fromEntries(parsed.searchParams);
  if (!search.secret) return null;

  const label = decodeURI(parsed.pathname.replace(/^\//, '')).split(':');
  const account = label.splice(-1)[0] || null;
  const issuer = label.splice(-1)[0] || null;

  const secret = importSecret(search.secret);

  const params = {type, issuer, account, secret};

  if (search.algorithm) params.algorithm = search.algorithm.toLowerCase();
  if (search.issuer) params.issuer = search.issuer;
  if (search.digits) params.digits = parseInt(search.digits);
  if (search.period) params.period = parseInt(search.period);
  if (search.counter) params.counter = parseInt(search.counter);

  return params;
};

/**
 * Convert params to URI
 * @param {import('../index').TOTPParams|import('../index').HOTPParams} params
 * @returns {string}
 */
export const formatURI = params => {
  const uri = new URL(`otpauth://${['totp', 'hotp'].includes(params.type)  ? params.type : 'hotp'}`);

  const label = [];
  if (params.issuer) label.push(encodeURI(params.issuer));
  if (params.account) label.push(encodeURI(params.account));
  uri.pathname = '/' + label.join(':');

  uri.searchParams.set('secret', exportSecret(params.secret));
  if (params.issuer) uri.searchParams.set('issuer', params.issuer);
  if (params.algorithm) uri.searchParams.set('algorithm', params.algorithm.toUpperCase());
  if (params.digits) uri.searchParams.set('digits', params.digits);
  if (params.period) uri.searchParams.set('period', params.period);
  if (params.counter) uri.searchParams.set('counter', params.counter);

  return uri.toString();
};

