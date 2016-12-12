'use strict'

const got          = require('got')
const promiseRetry = require('promise-retry')
const log          = require('fancy-log')
const sample       = require('lodash.sample')

class LgtmIn {
  constructor({ lgtmInUrls, ca }) {
    this.lgtmInUrls  = lgtmInUrls
    this.concurrency = 5
    this.cacheSize   = 15
    this.imageUrls   = []
    this.ca          = ca || []
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
      this.imageUrls.push(promiseRetry(
        retry => this.fetch().catch(retry),
        { retries: 30, randomize: true }
      ))
    }
  }

  endpoint() {
    return sample(this.lgtmInUrls)
  }

  fetch() {
    return got(this.endpoint(), { json: true, ca: this.ca })
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
