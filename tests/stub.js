const fixtures = require('./fixtures')

module.exports = {
  get () {
    return new Promise((resolve) => resolve({data: fixtures.responseFullContact}))
  }
}
