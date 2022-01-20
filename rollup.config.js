export default {
  input: './index.js',
  plugins: [],
  external: [
    'url',
    'crypto',
    'thirty-two',
  ],
  output: [{
    file: './dist/hotp.es.js',
    format: 'es',
    sourcemap: true
  }, {
    file: './dist/hotp.cjs.js',
    format: 'cjs',
    sourcemap: true
  }],
  watch: {
    chokidar: true
  }
};
