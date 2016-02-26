const axios = process.env.NODE_ENV === 'development' ? require('../tests/stub') : require('axios')
import parseResponse from './parseResponse'

const FULLCONTACT_TOKEN = process.env.FULLCONTACT_TOKEN

const FULLCONTACT_URL = 'https://api.fullcontact.com/v2'

export default function (email, options = {}) {
  if (!email) {
    return Promise.reject('missing email')
  }
  return axios.get(`${FULLCONTACT_URL}/person.json?email=${email}&apiKey=${FULLCONTACT_TOKEN}`)
    .then(parseResponse)
    .then((data) => {
      if (data.name) {
        if (data.followers > 100 || options.bypassFamous) {
          return {
            message: '',
            data: {
              as_user: true,
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
            }
          }
        } else {
          return {
            message: `${data.name} isn't really famous`
          }
        }
      } else {
        return {
          message: 'Sorry, didn\'t found anything'
        }
      }
    })
}
