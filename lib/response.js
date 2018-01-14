'use strict'

/**
 * Module dependencies.
 * @private
 */
const http = require('http')
const fs = require('fs')
const engine = require('ejs')

const { STATUS_CODES: statusCode } = http

/**
 * exports module that help in main module
 * @param  response injection dependence
 */
module.exports = (request, response, storeSet) => {
  /**
   * method send will help send information to browser
   * @param  {[type]} value the value that will recive
   * @return {object} this object
   */
  response.send = function (value) {
    console.log(request.url)
    response.end(value)
  }

  /**
   * set the status code
   * @param  {Number} value
   * @return {object} this object
   */
  response.status = function (value) {
    if (statusCode.hasOwnProperty(value)) {
      response.statusCode = value
      return this
    }

    throw new Error(`Not has ${value} in http module`)
  }

  /**
   * json method send to a json application
   * @param  {String} value
   * @return {object} return this object
   */
  response.json = function (value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value)
      response.writeHead(200, {'Content-Type': 'application/json'})
    }

    response.write(value)
    response.end()
    return this
  }

  /**
   * redirect function throw a new url
   * @param  {string} pathing
   * @return {object} return this object
   */
  response.redirect = function (pathing) {
    response.writeHead(301, {
      'Location': pathing
    })
    response.end()
    return this
  }

  /**
   * Method responsible that render on browser of the ejs engine to html
   * @param  {string} path
   * @param  {object} context
   * @return {object} this method
   */
  response.render = function (path, context) {
    let readable = fs.createReadStream(`${storeSet.views}/${path}.ejs`)
    let html = null

    readable.on('data', chunck => {
      html = engine.render(chunck.toString(), context)

      if (storeSet.minify) {
        html = html.replace(/\n/gim, '').replace(/>\s/gim, '>')
      }
    })

    readable.on('end', () => {
      response.setHeader('Content-Type', 'text/html')
      response.end(html)
    })

    return this
  }
}
