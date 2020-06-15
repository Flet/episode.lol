import tvdb from '../_lib/tvdb'

export default async (req, res) => {
  const { episode } = req.query

  if (!episode) {
    return res.status(400).json({ error: 'missing episode.' })
  }

  const resp = await tvdb.episodeById(episode)

  return res.status(200).json(resp)
}
