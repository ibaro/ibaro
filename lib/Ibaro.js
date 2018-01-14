/**
 * Ibaro router
 * @copyright 2018 João Luís Ribeiro Ribeiro
 * @author João Ribeiro <joaoluis@ibaro.com.br>
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */
const http = require('http')
const HelperFn = require('./response')
const middleware = require('./middleware')
const mime = require('mime-types')
const fs = require('fs')

/**
 * destructing assigment of the http module
 * @private
 */
const { METHODS, createServer } = http

/**
 * middleware store
 * @private
 */
let storeInterceptors = []

/**
 * store of the settings like views, static and minify
 * @type {Object}
 * @private
 */
let storeSet = {}

/**
 * store routes
 * @type {Object}
 * @private
 */
let route = {}

/**
 * The class that make the magic happens
 * @class
 */
class Ibaro {
  /**
  * When this class be instanced will execute the method
  * init
  * @constructor
  */
  constructor () {
    this._init()
  }

  set (info, data) {
    if (typeof data === 'string') {
      data = data.split(' ')
      storeSet[info] = data
    } else {
      storeSet[info] = data
    }
  }

  /**
   * Middleware method
   * @param  {Function} interceptor
   */
  use (interceptor) {
    storeInterceptors.push(interceptor)
  }

  /**
   * This method make the method request like function that this function
   * @private
   */
  _init () {
    METHODS.forEach(method => {
      route[method] = {}

      /**
       * This function will help the developer at build routes
       * all method defined on http module exist on this function
       * @param  {String} path
       * @param  {Function} callback
       */
      Ibaro.prototype[method.toLowerCase()] = function (path, callback) {
        route[method][path] = callback
      }
    })

    this.server = createServer((req, res) => {
      HelperFn(req, res, storeSet)

      /**
       * call the static files
       * @return {Boolean} false
       */
      if (!route[req.method][req.url]) {
        const uri = storeSet.static[0] + req.url
        let mimetype = mime.lookup(uri)
        res.statusCode = 200

        res.setHeader('Content-Type', mimetype)

        let readStrem = fs.ReadStream(uri)

        readStrem.on('open', () => {
          readStrem.pipe(res)
        })

        readStrem.on('error', () => {
          res.statusCode = 404
          res.end('NOT FOUND FILE' + req.url)
        })

        return false
      }

      /**
       * The middleware function will execute
       * when if defined in use method
       */
      middleware(0, req, res, storeInterceptors)
      route[req.method][req.url](req, res)
    })
  }

  /**
   * will listen the port for the server running
   * @param  {Number}  port
   * @param  {Function} callback
   */
  listen (port, callback) {
    this.server.listen(port, callback)
  }
}

/**
 * exporting the main module
 * @module
 */
module.exports = Ibaro
