'use strict'

const co      = require('co')
const thenify = require('thenify')
const log     = require('fancy-log')

const RtmClient = require('@slack/client').RtmClient
const WebClient = require('@slack/client').WebClient
const LgtmIn    = require('./lgtm_in')

class SlackBot {
  constructor({ token, lgtmInUrls, botUser }) {
    this.startedAt = (new Date()).getTime()
    this.lgtmIn    = new LgtmIn(lgtmInUrls)
    this.rtm       = new RtmClient(token, { autoReconnect: true, logLevel: 'error' })
    this.web       = new WebClient(token)
    this.botUser   = botUser
  }

  listen() {
    log('Listening ...')
    this.rtm.start()
    this.rtm.on('authenticated', this.onAuthenticated.bind(this))
    this.rtm.on('message', this.onMessage.bind(this))
  }

  onAuthenticated(message) {
    const getTeamInfo = thenify(this.web.team.info.bind(this.web.team))

    co(function* () {
      log('Connected')

      try {
        const teamInfo = yield getTeamInfo()
        delete teamInfo['team']['icon']
        log('Team:', JSON.stringify(teamInfo))
      } catch (e) {
        log.error(e)
      }
    })
  }

  onMessage(message) {
    const _this       = this
    const postMessage = this.web.chat.postMessage.bind(this.web.chat)

    co(function* () {
      try {
        const channel = message.channel
        const ts      = parseFloat(message.ts) * 1000
        const pattern = /^LGTM$/i

        if (_this.startedAt < ts && pattern.test(message.text)) {
          log('Recevied:', JSON.stringify(message))

          const imageUrl = yield _this.lgtmIn.next()
          yield postMessage(channel, imageUrl, _this.botUser)

          log('Posted:', imageUrl)
        }
      } catch (e) {
        log.error(e)
      }
    })
  }
}

module.exports = SlackBot
