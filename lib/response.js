/**
 * exports module that help in main module
 * @param  res injection dependence
 */
module.exports = res => {
  /**
   * method send will help send information to browser
   * @param  {[type]} value the value that will recive
   */
  res.send = (value) => {
    if (typeof value === 'object') {
      value = JSON.stringify(value)
      res.writeHead(200, {'Content-Type': 'application/json'})
    }

    res.write(value)
    res.end()
  }
}
