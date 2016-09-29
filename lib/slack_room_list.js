'use strict'

const co           = require('co')
const promiseRetry = require('promise-retry')
const thenify      = require('thenify')
const log          = require('fancy-log')
const Rx           = require('rx')

class SlackRoomList {
  constructor(web) {
    this.web       = web
    this.rooms     = new Rx.BehaviorSubject(null)
    this.progress  = false
    this.updatedAt = null
  }

  findById(id) {
    return this.rooms
      .filter(rooms => !!rooms)
      .first()
      .map(rooms => rooms.find(room => room.id === id))
      .toPromise()
  }

  sync() {
    log('Syncing rooms ...')

    if (this.progress) {
      log('Already syncing rooms started')
      return Promise.resolve()
    }
    this.progress = true

    const _this = this
    return co(function* () {
      try {
        const rooms = yield promiseRetry(retry => _this.fetch().catch(retry))

        log('Synced rooms')
        process.nextTick(_ => _this.rooms.onNext(rooms))
      } catch (e) { }

      _this.progress = false
    })
  }

  fetch() {
    const getChannels = thenify(this.web.channels.list.bind(this.web.channels))
    const getGroups   = thenify(this.web.groups.list.bind(this.web.groups))

    return co(function* () {
      const [ { channels }, { groups } ] = yield [ getChannels(), getGroups() ]
      return channels.concat(groups)
    })
  }
}

module.exports = SlackRoomList
