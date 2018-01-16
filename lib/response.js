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
  response.send = function (value, mimetype) {
    if (typeof value === 'object') {
      value = JSON.stringify(value)
      response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'})
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
  	/**
  	 * if slash's in storeSet.views will replace
  	 * @param  {buffer} chunck
  	 */
  	if (/\/$/g.test(storeSet.views[0])) {
  		storeSet.views[0].replace(/\/$/g, '')
  	}

  	console.log(storeSet.views)

    let readable = fs.createReadStream(`${storeSet.views}/${path}.ejs`)
    let html = null

    readable.on('data', chunck => {
      html = engine.render(chunck.toString(), context, {filename: storeSet.views[0], root: storeSet.views[0]})

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
