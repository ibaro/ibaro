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
const response = require('./response')
const middleware = require('./middleware')
const params = require('./params')
const mime = require('mime-types')
const http = require('http')
const fs = require('fs')
const path = require('path')

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
    this.routes = {}
    this.getValueRoute = {}
    this._generateMethod()
  }

  /**
   * set some configure like static paths, minify html and more
   * @param {string} info
   * @param {sting} data
   */
  set (info, data) {
    if (typeof data === 'string') {
      data = data.split(' ')
      storeSet[info] = data
    } else {
      storeSet[info] = data
    }
  }

  /**
   * _generateMethod it's a function that build all methods like
   * POST, PUT, GET, DELETE and more
   *
   */
  _generateMethod () {
  	METHODS.forEach(method => {
		  /**
		   * This function will help the developer at build routes
		   * all method defined on http module exist on this function
		   * @param  {String} path
		   * @param  {Function} callback
		   */
		  Ibaro.prototype[method.toLowerCase()] = function (path, callback) {
		    this._requestParams(path, callback, method)
		    return this
		  }
	  })
  }

  /**
   * If has :id are indecate that has a parameter
   * on method function
   *
   * @param  {string}   path
   * @param  {Function} callback
   * @param  {string}   method
   */
  _requestParams (origin, callback, method) {
  	if (origin.includes(':')) {
  		const param = params(origin)
  		const basepath = origin.replace(/\/:\w.+/g, '')

  		this.getValueRoute[basepath] = {origin, callback, method, param}
  	} else {
  		this.getValueRoute[origin] = {origin, callback, method}
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
   * This method help at configure the routes
   * before that execute then create req.param
   * @param  {object} request
   */
  _getRequest (request) {
  	request.param = {}

  	const property = (request.url === '/') ? '' : request.url.match(/^\/\w+/)[0]


  	if (this.getValueRoute.hasOwnProperty(property)) {
      const brokenUrl = request.url.split('/')
      const value = brokenUrl.filter(item => !this.getValueRoute[property].origin.includes(item))

      this.getValueRoute[property].param.forEach((items, index) => {
      	request.param[items] = value[index]
      })

      this.getValueRoute[property].origin = request.url
      const { method, callback } = this.getValueRoute[property]
      this.routes[method] = {}
      this.routes[method][this.getValueRoute[property].origin] = callback
  	} else {
  	  if (this.getValueRoute[request.url]) {
  		  const { origin, callback, method } = this.getValueRoute[request.url]
  		  this.routes[method] = {}
        this.routes[method][origin] = callback
  	  }
  	}
  }

  /**
   * Helper method to execute on method
   * createServer of the http module
   * @private
   */
  _init () {
  	/**
  	 * Keep the context class
  	 * @type {object}
  	 */
  	const context = this

    /**
     * execute the server function
     * @param  {object} req
     * @param  {object} res
     */
    return (req, res) => {
    	response(req, res, storeSet)
      context._getRequest(req)

	    /**
	     * call the static files
	     * @return {Boolean} false
	     */
	    if (!context.routes[req.method][req.url]) {
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
	        res.end(`NOT FOUND ${req.method} ${req.url}`)
	      })

	      return false
	    }

	    /**
	     * The middleware function will execute
	     * when if defined in use method
	     */
	    middleware(0, req, res, storeInterceptors)

	    /**
	     * execute the routes
	     */
	    context.routes[req.method][req.url](req, res)
    }
  }

  /**
   * will listen the port for the server running
   * @param  {Number}  port
   * @param  {Function} callback
   */
  listen (port, callback) {
    const server = createServer(this._init())
    return server.listen(port, callback)
  }
}


/**
 * exporting the main module
 * @module
 */
module.exports = Ibaro
