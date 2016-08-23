'use strict'

const got          = require('got')
const promiseRetry = require('promise-retry')
const log          = require('fancy-log')

class LgtmIn {
  constructor(endpoint) {
    this.endpoint    = endpoint
    this.concurrency = 3
    this.cacheSize   = 10
    this.imageUrls   = []
    this.preload()
  }

  next() {
    this.update()
    return this.imageUrls.shift()
  }

  preload() {
    log('Preloading ...')
    this.update()
  }

  update() {
    if (this.imageUrls.length > this.cacheSize) {
      return
    }

    log('Fetch queued:', this.concurrency)

    for (let i = 0; i < this.concurrency; ++i) {
      this.imageUrls.push(promiseRetry(retry =>
        this.fetch().catch(retry)
      ))
    }
  }

  fetch() {
    return got(this.endpoint, { json: true })
      .then(res => {
        const imageUrl = res.body.actualImageUrl

        if (typeof imageUrl !== 'string') {
          return Promise.reject('`actualImageUrl` is not found')
        }

        log('LGTM image resolved:', imageUrl)
        return imageUrl
      })
  }
}

module.exports = LgtmIn
