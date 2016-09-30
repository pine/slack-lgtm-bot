slack-lgtm-bot
--------------

## Requirements

- Node.js v4.5.0 ~

## Getting Started

```
$ npm install -g git+https://github.com/pine/slack-lgtm-bot.git
$ SLACK_API_TOKEN=XXX slack-lgtm-bot
```

## Options
You can set any options uses environment variables.

- `SLACK_API_TOKEN` Slack API token
- `SLACK_USERNAME` Slack username
  - Default: `'LGTM'`
- `SLACK_ICON_URL` Slack icon URL
  - Default: `''`
- `LGTM_IN_URL`
  - Default: `'http://lgtm.in/g'`
  - API endpoint of [lgtm.in](http://lgtm.in/)
  - If you have personal lgtm.in list, set to `'http://lgtm.in/g/username'`
- `LGTM_IN_URLS` Slack API endpoint URLs (comma separated)
- `SLACK_CHANNELS` Slack channels of bot enabled (comma separated)
  - Default: `''` (not limited)
  - Example: `'general,random'`

## License
MIT
