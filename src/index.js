import {RtmClient, RTM_EVENTS, WebClient} from 'slack-client'
import express from 'express'
import bl from 'bl'
import checkEmail from './checkEmail'

const SLACK_TOKEN = process.env.SLACK_TOKEN

if (!process.env.SLACK_TOKEN || !process.env.FULLCONTACT_TOKEN) {
  console.error('The bot was started without accounts to post with.')
  console.error('To get started:')
  if (!process.env.SLACK_TOKEN) {
    console.error('* Visit https://slack.com/apps/A0F7YS25R-bots')
    console.error('* Add a new configuration for your team')
  }
  if (!process.env.FULLCONTACT_TOKEN) {
    console.error('* Visit https://portal.fullcontact.com/signup')
    console.error('* Create an account')
  }
  console.error('* Run the following command:')
  console.error('SLACK_TOKEN=insert_slack_token_here FULLCONTACT_TOKEN=insert_full-contact_key_here npm start')
  console.error('* Run the following command in another tab:')
  console.error('curl -X POST -d @tests/data/post.data http://localhost:5000/')
  console.error('* Check that it commented in your "famous" channel')
  process.exit(1)
}

const web = new WebClient(SLACK_TOKEN)

/*
 *
 * Start slack bot to listen to `@bot-name info emailToCheck`
 *
 */

const rtm = new RtmClient(SLACK_TOKEN, {
  logLevel: 'debug',
  autoReconnect: true
})

function logError (err) { if (err) { console.error('error', err) } }

rtm.start()

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  // Listens to all `message` events from the team
  const {text, channel} = message

  const matchingStrings = [
    `<@${rtm.activeUserId}> info `,
    `<@${rtm.activeUserId}> infos `,
    `<@${rtm.activeUserId}>: info `,
    `<@${rtm.activeUserId}>: infos `
  ]

  if (text && text.indexOf && matchingStrings.some((s) => text.indexOf(s) !== -1)) {
    const emailToCheck = /<mailto:([A-Za-z0-9@\.]+)\|[A-Za-z0-9@\.]+>/igm.exec(text.split(`<@${rtm.activeUserId}> info `)[1])[1]
    rtm.sendMessage(`ok, will look into ${emailToCheck}`, channel)

    checkEmail(emailToCheck).then(({message, data}) => {
      web.chat.postMessage(channel, message, data, logError)
    }).catch(logError)
  }
})

rtm.on('error', (error) => {
  console.error('error', error)
})

/*
 *
 * Start server
 *
 */

const app = express()

app.post('/', (req, res) => {
  req.pipe(bl((err, body) => {
    if (err) {
      console.error('error', err)
    }
    let data = {}
    try {
      data = JSON.parse(body.toString())
    } catch (e) {
      console.error('error', e)
    }
    const {channel, emailToCheck} = data
    checkEmail(emailToCheck).then(({message, data}) => {
      if (data) {
        web.chat.postMessage(channel, message, data, logError)
      }
      res.end()
    }).catch((e) => {
      console.error('error', e)
      res.end()
    })
  }))
})

app.get('/', (req, res) => {
  res.send(
    'Stalker in motion. ' +
    'Go to https://github.com/mathieudutour/famous for more information.'
  )
})

app.set('port', process.env.PORT || 5000)

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'))
})
