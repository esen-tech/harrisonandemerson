const withTM = require('next-transpile-modules')([
  '@esen/components',
  '@esen/essence',
  '@esen/utils',
])
const { i18n } = require('./next-i18next.config')

module.exports = withTM({
  compiler: {
    styledComponents: true,
  },
  i18n,
  publicRuntimeConfig: {
    env: process.env.NEXT_PUBLIC_ENV,
  },
})
