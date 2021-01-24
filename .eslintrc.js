module.exports = {
  extends: '@gidw/eslint-config-standard-node',
  parserOptions: {
    ecmaVersion: 5,
    sourceType: 'script'
  },
  env: {
    node: true
  },
  ignorePatterns: [
    'node_modules/'
  ]
}
