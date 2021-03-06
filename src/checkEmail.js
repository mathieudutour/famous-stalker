const axios = process.env.NODE_ENV === 'development' ? require('../tests/stub') : require('axios')
import parseResponse from './parseResponse'

const FULLCONTACT_TOKEN = process.env.FULLCONTACT_TOKEN

const FULLCONTACT_URL = 'https://api.fullcontact.com/v2'

const limit = process.env.FOLLOWERS_LIMIT || 1000

export default function (email, options = {}) {
  if (!email) {
    return Promise.reject('missing email')
  }
  return axios.get(`${FULLCONTACT_URL}/person.json?email=${email}&apiKey=${FULLCONTACT_TOKEN}`)
    .then(parseResponse)
    .then((data) => {
      if (data.name) {
        if (data.followers >= limit || options.bypassFamous) {
          return {
            message: '',
            data: {
              icon_emoji: ':eyes:',
              username: 'Stalker',
              attachments: JSON.stringify([{
                fallback: `${data.name} is quite famous`,
                color: 'good',
                pretext: 'Say hello to:',
                author_name: `${data.name} at ${email}`,
                author_icon: data.photo,
                author_link: `mailto:${email}`,
                text: data.bio,
                fields: data.fields
              }])
            },
            raw: data
          }
        } else {
          return {
            message: `${data.name} isn't really famous`,
            raw: data.raw
          }
        }
      } else {
        return {
          raw: data.raw,
          message: 'Sorry, didn\'t found anything'
        }
      }
    })
}
