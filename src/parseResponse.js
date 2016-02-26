export default function ({data = {}}) {
  const gender = (data.demographics || {}).gender ? (data.demographics.gender === 'Male' ? 'he' : 'she') : 'he/she'

  const fields = []

  const twitter = (data.socialProfiles || []).find((profile) => profile.type === 'twitter')

  if (twitter) {
    fields.push({
      title: 'Twitter',
      value: `<${twitter.url}|${twitter.username}> (${twitter.followers} followers)`,
      short: true
    })
  }

  const linkedin = (data.socialProfiles || []).find((profile) => profile.type === 'linkedin')

  if (linkedin) {
    fields.push({
      title: 'LinkedIn',
      value: `<${linkedin.url}|${linkedin.username}>`,
      short: true
    })
  }

  const github = (data.socialProfiles || []).find((profile) => profile.type === 'github')

  if (github) {
    fields.push({
      title: 'GitHub',
      value: `<${github.url}|${github.username}>`,
      short: true
    })
  }

  const organization = (data.organizations || []).find((org) => org.isPrimary)

  if (organization) {
    fields.push({
      title: 'Employment',
      value: organization.name,
      short: true
    })
    fields.push({
      title: 'Title',
      value: organization.title,
      short: true
    })
  }

  return {
    name: (data.contactInfo || {}).fullName,
    photo: ((data.photos || []).find((photo) => photo.isPrimary) || {}).url,
    gender,
    bio: (twitter || {}).bio,
    fields,
    followers: (twitter || {}).followers
  }
}
