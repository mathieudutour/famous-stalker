function findProfile (data, profileType) {
  return (data.socialProfiles || []).find((profile) => profile.type === profileType)
}

export default function ({data = {}}) {
  const gender = (data.demographics || {}).gender ? (data.demographics.gender === 'Male' ? 'he' : 'she') : 'he/she'

  const fields = []

  const twitter = findProfile(data, 'twitter')

  if (twitter) {
    fields.push({
      title: 'Twitter',
      value: `<${twitter.url}|${twitter.username}> (${twitter.followers} followers)`,
      short: true
    })
  }

  const linkedin = findProfile(data, 'linkedin')

  if (linkedin) {
    fields.push({
      title: 'LinkedIn',
      value: `<${linkedin.url}|${linkedin.username}>`,
      short: true
    })
  }

  const github = findProfile(data, 'github')

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
    raw: data,
    name: (data.contactInfo || {}).fullName,
    photo: ((data.photos || []).find((photo) => photo.isPrimary) || {}).url,
    gender,
    bio: (twitter || {}).bio,
    fields,
    followers: (twitter || {}).followers
  }
}
