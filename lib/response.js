'use strict'

/**
 * Module dependencies.
 * @private
 */
const http = require('http')
const fs = require('fs')
const engine = require('ejs')
const minify = require('html-minifier').minify

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
  response.send = function (value, mimetype) {
    if (typeof value === 'object') {
      value = JSON.stringify(value)
      response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'})
      response.end(value)
      return this
    }

    if (!mimetype) {
      mimetype = 'plan'
    }

    response.writeHead(200, {'Content-Type': `text/${mimetype}`})
    response.write(value)
    response.end()
    return this
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
    response.writeHead(302, {
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
    const pathFile = (storeSet.views) ? `${storeSet.views}/${path}.ejs` : path + '.ejs'

    let readable = fs.createReadStream(pathFile)
    let html = null

    readable.on('data', chunck => {
      html = engine.render(chunck.toString(), context, {filename: pathFile, root: pathFile})

      if (storeSet.minify) {
        html = minify(html, {
          removeComments: true,
          collapseWhitespace: true
        })
      }
    })

    readable.on('error', () => {
      response.end(`NOT FOUND ${pathFile}/${path}`)
    })

    readable.on('end', () => {
      response.setHeader('Content-Type', 'text/html')
      response.end(html)
    })

    return this
  }
}
