import tvdb from './_lib/tvdb'

export default async (req, res) => {
  const { q } = req.query

  if (!q) {
    return res.status(400).json({ error: 'missing query parameter q.' })
  }

  const resp = await tvdb.searchByName(q)

  return res.status(200).json(resp.data)
}
