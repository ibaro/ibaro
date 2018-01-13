const http = require('http')
const HelperFn = require('./response')
const middleware = require('./middleware')

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
 * The class that make the magic happens
 * @class
 * @author João Ribeiro <joaoluis@ibaro.com.br>
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
    const context = this

    METHODS.forEach(method => {
      /**
       * This function will help the developer at build routes
       * all method defined on http module exist on this function
       * @param  {String} path
       * @param  {Function} callback
       */
      Ibaro.prototype[method.toLowerCase()] = function (path, callback) {
        context.server = createServer((req, res) => {
          middleware(0, req, res, storeInterceptors)

          if (req.url === path) {
            HelperFn(res)
            callback(req, res)
          } else {
            res.statusCode = 404
            res.end(`The url ${req.url} not was defined on method ${req.method}`)
          }
        })
      }
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
