/**
 * This function get the function informed on use method in Ibaro Class
 * and execute before the render happens
 * @param  {Number} count
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Array} store
 */
function middleware (count, req, res, store) {
  const interceptor = store[count]

  if (!interceptor) {
    return false
  }

  interceptor(req, res, () => {
    middleware(++count, req, res, store)
  })
}

/**
 * exporting the module middleware
 * @module
 */
module.exports = middleware
