const { STATUS_CODES: statusCode } = require('http')

/**
 * exports module that help in main module
 * @param  res injection dependence
 */
module.exports = res => {
  /**
   * method send will help send information to browser
   * @param  {[type]} value the value that will recive
   * @return {object} this object
   */
  res.send = function (value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value)
      res.writeHead(200, {'Content-Type': 'application/json'})
    }

    res.write(value)
    res.end()
    return this
  }

  /**
   * set the status code
   * @param  {Number} value
   * @return {object} this object
   */
  res.status = function (value) {
    if (statusCode.hasOwnProperty(value)) {
      res.statusCode = value
      return this
    }

    throw new Error(`Not has ${value} in http module`)
  }

  /**
   * json method send to a json application
   * @param  {String} value
   * @return {object} return this object
   */
  res.json = function (value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value)
      res.writeHead(200, {'Content-Type': 'application/json'})
    }

    res.write(value)
    res.end()
    return this
  }
}
