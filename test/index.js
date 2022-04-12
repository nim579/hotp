import assert from 'assert';
import * as hotp from '../index';
import OTP from '../lib/OTP';

describe('module', () => {
  it('imports', () => {
    assert.equal(typeof hotp.formatURI, 'function', 'formatURI()');
    assert.equal(typeof hotp.parseURI, 'function', 'parseURI()');
    assert.equal(typeof hotp.importSecret, 'function', 'importSecret()');
    assert.equal(typeof hotp.exportSecret, 'function', 'exportSecret()');
    assert.equal(typeof hotp.createOTP, 'function', 'createOTP()');
    assert.notEqual(typeof hotp.createOTP.prototype, 'object', 'not class createOTP()');

    assert.equal(typeof hotp.TOTP.prototype, 'object', 'class TOTP');
    assert.equal(typeof hotp.HOTP.prototype, 'object', 'class HOTP');
  });

  it('TOTP', () => {
    const otp = new hotp.TOTP({
      secret: hotp.importSecret('74======'),
      account: 'acc',
      issuer: 'iss'
    });

    assert.ok(otp instanceof OTP, 'is OTP');

    assert.ok(otp._date() <= Date.now());

    otp._date = () => 10000;
    assert.equal(otp.getTimeout(), 20);

    otp._date = () => 11000;
    assert.equal(otp.getTimeout(), 19);

    assert.equal(otp.getCode(), '559234');
    assert.deepEqual(
      otp.get(),
      { code: '559234', type: 'totp', issuer: 'iss', account: 'acc', timeout: 19 }
    );

    assert.equal(
      otp.toString(),
      'otpauth://totp/iss:acc?secret=74%3D%3D%3D%3D%3D%3D&issuer=iss&algorithm=SHA1&digits=6&period=30'
    );
  });

  it('HOTP', () => {
    const otp = new hotp.HOTP({
      secret: hotp.importSecret('74======'),
      account: 'acc',
      issuer: 'iss',
      counter: 2
    });

    assert.ok(otp instanceof OTP, 'is OTP');

    assert.equal(otp.counter, 2);
    assert.equal(otp.counter, 2);

    assert.equal(otp.getCode(), '052701');
    assert.equal(otp.counter, 3);

    assert.equal(otp.getCode(), '840180');
    assert.equal(otp.counter, 4);

    assert.deepEqual(
      otp.get(),
      { code: '629675', type: 'hotp', issuer: 'iss', account: 'acc', counter: 5 }
    );

    assert.equal(
      otp.toString(),
      'otpauth://hotp/iss:acc?secret=74%3D%3D%3D%3D%3D%3D&issuer=iss&algorithm=SHA1&digits=6&counter=5'
    );
  });

  it('createOTP()', () => {
    let otp;

    otp = hotp.createOTP('otpauth://hotp/iss:acc?secret=74%3D%3D%3D%3D%3D%3D&issuer=iss&algorithm=SHA1&digits=6&counter=5');
    assert.ok(otp instanceof hotp.HOTP);

    otp = hotp.createOTP('otpauth://totp/iss:acc?secret=74%3D%3D%3D%3D%3D%3D&issuer=iss&algorithm=SHA1&digits=6&period=30');
    assert.ok(otp instanceof hotp.TOTP);

    otp = hotp.createOTP({
      type: 'hotp',
      secret: hotp.importSecret('74======'),
      account: 'acc',
      issuer: 'iss',
      counter: 2
    });
    assert.ok(otp instanceof hotp.HOTP);

    otp = hotp.createOTP({
      type: 'totp',
      secret: hotp.importSecret('74======'),
      account: 'acc',
      issuer: 'iss'
    });
    assert.ok(otp instanceof hotp.TOTP);

    otp = hotp.createOTP({
      secret: hotp.importSecret('74======'),
      account: 'acc',
      issuer: 'iss'
    });
    assert.ok(otp === null);

    otp = hotp.createOTP('otpauth://otp/iss:acc?secret=74%3D%3D%3D%3D%3D%3D&issuer=iss&algorithm=SHA1&digits=6&period=30');
    assert.ok(otp === null);
  });
});

