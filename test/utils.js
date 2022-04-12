import assert from 'assert';
import * as utils from '../lib/utils';

describe('utils.js', () => {
  it('intToBuffer()', () => {
    assert.equal(utils.intToBuffer(16).toString('hex'), '0000000000000010');
    assert.equal(utils.intToBuffer(16, 4).toString('hex'), '00000010');
    assert.equal(utils.intToBuffer(16, 2).toString('hex'), '0010');
    assert.equal(utils.intToBuffer(65536, 2).toString('hex'), '0000');
  });

  it('trunc()', () => {
    assert.ok(isNaN(utils.trunc(100500)), 'No length argument');
    assert.equal(utils.trunc(Buffer.from('fff', 'hex'), 6), '706432');
    assert.equal(utils.trunc(Buffer.from('fff', 'hex'), 2), '32');
    assert.equal(utils.trunc(Buffer.from('0', 'hex'), 2), '0');
  });

  it('padLeft()', () => {
    assert.equal(utils.padLeft('1'), '1');
    assert.equal(utils.padLeft('12'), '12');
    assert.equal(utils.padLeft('123'), '123');

    assert.equal(utils.padLeft('1', 6), '000001');
    assert.equal(utils.padLeft('12', 6), '000012');
    assert.equal(utils.padLeft('123', 6), '000123');
    assert.equal(utils.padLeft('1230', 6), '001230');
    assert.equal(utils.padLeft('0123', 6), '000123');

    assert.equal(utils.padLeft('1', 6, '-'), '-----1');
    assert.equal(utils.padLeft('12', 6, '-'), '----12');
    assert.equal(utils.padLeft('123', 6, '-'), '---123');
  });

  it('importSecret()', () => {
    assert.equal(utils.importSecret('74======').toString('hex'), 'ff');
    assert.equal(utils.importSecret('HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ').toString('hex'), '3dc6caa4824a6d288767b2331e20b43166cb85d9');
    assert.throws(() => utils.importSecret());
  });

  it('exportSecret()', () => {
    assert.equal(utils.exportSecret(Buffer.from('ff', 'hex')), '74======');
    assert.equal(utils.exportSecret(Buffer.from('3dc6caa4824a6d288767b2331e20b43166cb85d9', 'hex')), 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ');
    assert.throws(() => utils.exportSecret());
  });

  it('parseURI()', () => {
    assert.deepEqual(
      utils.parseURI('otpauth://totp/ACME%20Co:john@example.com?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&issuer=ACME%20Co&algorithm=SHA1&digits=6&period=30'),
      {
        type: 'totp', issuer: 'ACME Co', account: 'john@example.com', secret: utils.importSecret('HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ'),
        algorithm: 'sha1', digits: 6, period: 30
      }
    );

    assert.deepEqual(
      utils.parseURI('otpauth://hotp/ACME%20Co:test?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&issuer=ACME&counter=0'),
      {
        type: 'hotp', issuer: 'ACME', account: 'test', secret: utils.importSecret('HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ'),
        counter: 0
      }
    );

    assert.deepEqual(
      utils.parseURI('otpauth://hotp/?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&issuer=ACME&counter=0'),
      {
        type: 'hotp', issuer: 'ACME', account: null, secret: utils.importSecret('HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ'),
        counter: 0
      }
    );

    assert.deepEqual(
      utils.parseURI('otpauth://hotp/?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&counter=0'),
      {
        type: 'hotp', issuer: null, account: null, secret: utils.importSecret('HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ'),
        counter: 0
      }
    );

    assert.deepEqual(
      utils.parseURI('otpauth://hotp/test:test?issuer=ACME&counter=0'),
      null
    );

    assert.deepEqual(
      utils.parseURI('http://hotp/?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&issuer=ACME&counter=0'),
      null
    );

    assert.deepEqual(
      utils.parseURI('otpauth://otp/?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&issuer=ACME&counter=0'),
      null
    );
  });

  it('parseURI()', () => {
    assert.equal(
      utils.formatURI({type: 'totp', secret: Buffer.from('11', 'hex'), issuer: 'iss', account: 'acc'}),
      'otpauth://totp/iss:acc?secret=CE%3D%3D%3D%3D%3D%3D&issuer=iss'
    );

    assert.equal(
      utils.formatURI({ type: 'hotp', secret: Buffer.from('11', 'hex'), issuer: 'iss', algorithm: 'sha1', counter: 1 }),
      'otpauth://hotp/iss?secret=CE%3D%3D%3D%3D%3D%3D&issuer=iss&algorithm=SHA1&counter=1'
    );

    assert.equal(
      utils.formatURI({ type: 'hotp', secret: Buffer.from('11', 'hex'), account: 'acc', algorithm: 'sha1', counter: 1 }),
      'otpauth://hotp/acc?secret=CE%3D%3D%3D%3D%3D%3D&algorithm=SHA1&counter=1'
    );

    assert.equal(
      utils.formatURI({ secret: Buffer.from('11', 'hex'), account: 'acc', algorithm: 'sha1', counter: 1 }),
      'otpauth://hotp/acc?secret=CE%3D%3D%3D%3D%3D%3D&algorithm=SHA1&counter=1'
    );

    assert.equal(
      utils.formatURI({ type: 'otp', secret: Buffer.from('11', 'hex'), account: 'acc', algorithm: 'sha1', digits: 4, period: 60 }),
      'otpauth://hotp/acc?secret=CE%3D%3D%3D%3D%3D%3D&algorithm=SHA1&digits=4&period=60'
    );
  });
});
