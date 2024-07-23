const withTM = require('next-transpile-modules')([
  '@esen/components',
  '@esen/utils',
])
const { i18n } = require('./next-i18next.config')

module.exports = withTM({
  i18n,
  publicRuntimeConfig: {
    env: process.env.NEXT_PUBLIC_ENV,
  },
})
