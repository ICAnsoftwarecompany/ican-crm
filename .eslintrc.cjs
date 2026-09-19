module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['react-hooks'],
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    'no-unreachable': 'error',
    'valid-typeof': 'error',
    'no-unsafe-finally': 'error',
  },
}
