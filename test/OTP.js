import assert from 'assert';
import OTP from '../lib/OTP';


describe('OTP', () => {
  it('constructor & params', () => {
    assert.throws(() => new OTP(), { message: 'No secret key' });
    assert.throws(() => new OTP({}), { message: 'No secret key' });
    assert.throws(() => new OTP({ secret: Buffer.from('test'), algorithm: 'md5' }), { message: 'Unsupported algorithm' });

    const otp = new OTP({
      secret: Buffer.from('test'),
      algorithm: 'sha256',
      digits: 4,
      period: 60
    });

    assert.deepEqual(otp.params, {
      secret: Buffer.from('test'),
      algorithm: 'sha256',
      digits: 4,
      period: 60
    });

    otp.params = { secret: Buffer.from('test2') };

    assert.deepEqual(otp.params, {
      secret: Buffer.from('test2'),
      algorithm: 'sha1',
      digits: 6,
    });

    assert.equal(otp.type, null);
  });

  it('getCode()', () => {
    let otp;

    otp = new OTP({ secret: Buffer.from('test') });
    assert.equal(otp.getCode(), '941117');

    otp = new OTP({ secret: Buffer.from('test'), digits: 4 });
    assert.equal(otp.getCode(), '1117');

    otp = new OTP({ secret: Buffer.from('test'), algorithm: 'sha256' });
    assert.equal(otp.getCode(), '972871');
  });

  it('get()', () => {
    let otp;

    otp = new OTP({ secret: Buffer.from('test') });
    assert.deepEqual(otp.get(), { code: '941117', type: null, issuer: null, account: null });

    otp = new OTP({ secret: Buffer.from('test'), digits: 4, type: 'hotp', issuer: 'iss', account: 'acc' });
    assert.deepEqual(otp.get(), { code: '1117', type: 'hotp', issuer: 'iss', account: 'acc' });
  });

  it('toString()', () => {
    let otp;

    otp = new OTP({ secret: Buffer.from('test') });
    assert.equal(otp.toString(), 'otpauth://hotp/?secret=ORSXG5A%3D&algorithm=SHA1&digits=6');

    otp = new OTP({ secret: Buffer.from('test'), digits: 4, type: 'totp', issuer: 'iss', account: 'acc', algorithm: 'sha256' });
    assert.equal(otp.toString(), 'otpauth://totp/iss:acc?secret=ORSXG5A%3D&issuer=iss&algorithm=SHA256&digits=4');
  });
});
