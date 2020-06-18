import tvdb from '../_lib/tvdb'

export default async (req, res) => {
  const { series } = req.query

  if (!series) {
    return res.status(400).json({ error: 'missing query parameter q.' })
  }

  const [info, episodes] = await Promise.all([tvdb.seriesInfo(series), tvdb.seriesEpisodes(series)])

  res.setHeader('Cache-Control', 's-maxage=259200') // 3 days
  
  return res.status(200).json(
    {
      info, episodes: episodes
    }
  )
}
