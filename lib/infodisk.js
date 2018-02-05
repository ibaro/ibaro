/**
 *@author João Ribeiro <joaoluis@ibaro.com.br>
 *
 * @module Child_process
 * @module os
 * @private
 */
const { exec } = require('child_process')
const { platform } = require('os')

/**
 * This function execute if the OS be a unix system
 * @param  {string}   cmd
 * @param  {string}   local
 * @param  {Regexp}   firstRegexp
 * @param  {Regexp}   secondRegexp
 * @param  {Function} cb
 */
function getValue (cmd, local, firstRegexp, secondRegexp, cb) {
  if (platform() !== 'linux' && platform() !== 'darwin') {
    throw new Error('does not support for your platform')
  }

  const regexpOne = new RegExp(firstRegexp, 'g')
  const regexpTwo = new RegExp(secondRegexp, 'g')

  let info = {}

  exec(cmd, (err, data) => {
    if (err) {
      throw err
    }

    const value = data.trim().split('\n')
      .filter(item => item.includes(local))
      .map(item => item.replace(regexpOne, ' '))
      .join(' ')
      .split(' ')
      .filter(item => regexpTwo.test(item))

    info.total = value[1]
    info.used = value[2]
    info.free = value[3]
    info.percent = value[4]

    cb(err, info)
  })
}

/**
 * @class the class contains the method that show info dik
 */
class InfoDisk {
  constructor () {
    throw new Error('Hasn\'t constructor')
  }

  /**
   * Pretty method show the information with GB, MB etc..
   * @param  {string}   local
   * @param  {Function} cb
   */
  static pretty (local, cb) {
    getValue('df -h', local, '\/\w+|\/', '\\d+', (err, info) => {
      cb(err, info)
    })
  }

  /**
   * Raw method show in bits the information disk
   * @param  {string}   local
   * @param  {Function} cb
   */
  static raw (local, cb) {
    getValue('df -k', local, '\/\w+|\/|\D', '\\d', (err, info) => {
      cb(err, info)
    })
  }
}

/**
 * exporting the class InfoDisk
 * @type {object}
 */
module.exports = InfoDisk
