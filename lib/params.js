'use strict'

/**
 * Take a path and get the params defined
 * @param  {string} path
 * @return {string}
 */
module.exports = (path) => {
  const regexp = /:\w+/g
  const params = []

  path.match(regexp).forEach(param => {
    params.push(param.replace(':', ''))
  })

  return params
}
