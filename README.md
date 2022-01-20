# HOTP manager

## Usage

### General

```js
import { createOTP } from 'hotp.js';

const otp = createOTP('otpauth://totp/ACME%20Co:john@example.com?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&issuer=ACME%20Co&algorithm=SHA1&digits=6&period=30');

otp.get();
// {
//   "code": "123456",
//   "type": "totp",
//   "timeout": 12,
//   "issuer": "ACME Co",
//   "acount": "john@example.com"
// }

otp.getCode();
// 123456

otp.toString();
// otpauth://totp/ACME%20Co:john@example.com?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&issuer=ACME%20Co&algorithm=SHA1&digits=6&period=30
```

### Classess

```js
import { HOTP, TOTP } from 'hotp.js';

const hotp = new HOTP({
  secret: Buffer, // <Buffer >
  counter: 1,
  // not required
  algorithm: 'sha1', // sha1, sha256, sha512, default sha1
  digits: 6, // 6, 8, default 6
  issuer: 'Some issuer',
  account: 'Some username'
});

hotp.evalCounter(); // increment counter, returns result
hotp.counter; // current counter


const totp = new TOTP({
  secret: Buffer, // <Buffer >
  // not required
  period: 30, // period in seconds, default 30
  algorithm: 'sha1', // sha1, sha256, sha512, default sha1
  digits: 6, // 6, 8, default 6
  issuer: 'Some issuer',
  account: 'Some username'
});

totp.getTimeout(); // time in seconds before code updates
```

### Utils

``` js
import { formatURI, parseURI, importSecret, exportSecret } from 'hotp.js';

formatURI({
  type: 'totp',
  secret: Buffer,
  algorithm: 'sha1',
  digits: 6,
  period: 30,
  counter: 0,
  issuer: 'Some issuer',
  account: 'Sume username'
});
/// otpauth://totp/...

parseURI('otpauth://totp...');
// {
//   "type: "totp",
//   ...
// }

importSecret(Base32String);
// <Buffer ...>

exportSecret(Buffer);
// Base32 string
```

### CommonJS

```js
const { createOTP, ... } = require('hotp.js');
```
