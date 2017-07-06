'use strict'

let app = require('./bin')

try {
  app()
} catch (e) {
  console.error(e)
}
