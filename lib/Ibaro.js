/**
 * Ibaro router
 * @copyright 2018 João Luís Ribeiro Ribeiro
 * @copyright 2018 Ibaro Digital <contato@ibaro.com.br>
 * @author João Ribeiro <joaoluis@ibaro.com.br>
 * @license https://opensource.org/licenses/MIT
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
const bodyParser = require('./any')
const mime = require('mime-types')
const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')
const queryString = require('querystring')
const engine = require('ejs')

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
    this.originParam = []
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
      Ibaro.prototype[method.toLowerCase()] = function (path, ...args) {
        this._requestParams(path, [...args], method)
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
  _requestParams (origin, args, method) {
    if (origin.includes(':')) {
      const param = params(origin)
      const basepath = origin.replace(/:\w.+/g, '')

      this.originParam.push(origin)
      this.getValueRoute[basepath] = { origin, args, method, param }
    } else {
      this.getValueRoute[origin] = { origin, args, method }
    }
  }

  /**
   * Middleware method
   * @param  {Function} interceptor
   */
  use (interceptor, fn) {
    storeInterceptors.push(interceptor)
  }

  /**
   * This method help at configure the routes
   * before that execute then create req.param
   * @param  {object} request
   */
  _getRequest (request) {
    if (url.parse(request.url).query) {
      const query = queryString.parse(url.parse(request.url).query)
      request.query = query
      request.url = request.url.match(/\/\w+/g).join('')
    }

    let filterURl = []

    this.originParam.forEach(items => {
      const splitUrl = request.url.replace(/^\//, '').split('/')
      const splitItems = items.replace(/^\//, '').split('/')
      if (request.url.includes(items.replace(/:\w+/g, ''))) {
        filterURl = splitItems.filter(item => request.url.includes(item) && splitUrl.length === splitItems.length)
      }
    })

    const property = (filterURl.length === 0) ? null : request.url.match(/^\/\w+/)[0] + '/'

    if (this.getValueRoute.hasOwnProperty(property) && request.method === 'GET') {
      const brokenUrl = request.url.split('/')
      const value = brokenUrl.filter(item => !this.getValueRoute[property].origin.includes(item))

      this.getValueRoute[property].param.forEach((items, index) => {
        request.param[items] = value[index]
      })

      const { method, args } = this.getValueRoute[property]
      this.routes[method] = {}
      this.routes[method][request.url] = args
    } else {
      if (this.getValueRoute[request.url]) {
        const { origin, args, method } = this.getValueRoute[request.url]
        this.routes[method] = {}
        this.routes[method][origin] = args
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
     * execute the server function
     * @param  {object} req
     * @param  {object} res
     */
    return (req, res) => {
      req.param = {}

      this.request = req
      this.response = res

      response(req, res, storeSet)
      this._getRequest(req)

      res.setHeader('X-Powerd-By', 'Ibaro Digital | http://www.ibaro.com.br/')

      /**
       * The middleware function will execute
       * when if defined in use method
       */
      middleware(0, req, res, storeInterceptors)

      /**
       * call the static files
       * @return {Boolean} false
       */
      const uri = (storeSet.static) ? storeSet.static[0] + req.url : req.url
      let mimetype = mime.lookup(uri)

      if (!storeSet.notFound && !this.routes[req.method][req.url] && !mimetype) {
        res.statusCode = 404
        res.end(`NOT FOUND ${req.method} ${req.url}`)
      }

      if (mimetype && mimetype !== 'image/x-icon') {
        const stat = fs.statSync(uri)
        const fileSize = stat.size
        const range = req.headers.range

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-')
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
          const chunksize = (end - start) + 1
          const file = fs.createReadStream(uri, {start, end})
          const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': mimetype
          }
          res.writeHead(206, head)
          file.pipe(res)
        } else {
          const head = {
            'Content-Length': fileSize,
            'Content-Type': mimetype
          }
          res.writeHead(200, head)
          fs.ReadStream(uri).pipe(res)
        }
        return false
      }

      /**
       * execute the routes
       */
      if (this.routes[req.method][req.url]) {
        this.routes[req.method][req.url].forEach(fn => fn(req, res))
      }
    }
  }

  /**
   * This method serve the favicon to browser
   * @param  {string} value
   * @return {function}
   */
  static favicon (value) {
    return (req, res, next) => {
      if (req.url.includes(path.basename(value))) {
        const fsIcon = fs.ReadStream(`${value}.ico`)

        fsIcon.on('open', () => fsIcon.pipe(res))
      }
      next()
    }
  }

  /**
   * this method will help take the info of the body
   * console.time('Ibaro')
   * with method post
   * @dependence body <https://github.com/Raynos/body>
   * @param  {Function} callback
   * @param {oject} options
   * @param {all} ..args store the parameters option and callback in array
   */
  body (...args) {
    if (args.length >= 3) {
      throw new Error('Please info just two parameter, options that object and before that callback')
    }

    bodyParser(this.request, this.response, ...args)
  }

  notFound (destinyPath) {
    storeSet.notFound = true

    return (req, res, next) => {
      if (!this.routes[req.method][req.url] && !mime.lookup(req.url)) {
        res.setStatus = 404

        const path = (storeSet.views) ? storeSet.views : req.url

        let read = fs.createReadStream(`${path}/${destinyPath}.ejs`)
        let html = ''

        read.on('data', chunck => {
          html = engine.render(chunck.toString(), {url: req.url, method: req.methd})
        })

        read.on('end', () => {
          res.statusCode = 404
          res.end(html)
        })
      }

      next()
    }
  }

  /**
   * will listen the port for the server running
   * @param  {Number}  port
   * @param  {Function} callback
   */
  listen (port, callback) {
    const server = createServer(this._init())
    console.log('\x1b[36m', 'POWERD BY: Ibaro Digital | http://www.ibaro.com.br/\n')
    return server.listen(port, callback)
  }
}

/**
 * exporting the main module
 * @module
 */
exports = module.exports = Ibaro
exports.infoDisk = require('./infodisk')
