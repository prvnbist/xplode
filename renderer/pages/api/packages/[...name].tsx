import axios from 'axios'

export default async function handler(req, res) {
   try {
      if (req.method === 'GET') {
         const { name = '' } = req.query

         const NPM_API = 'https://registry.npmjs.org'
         const { data } = await axios(`${NPM_API}/${name.join('/')}`)
         const { created, modified, ..._versions } = data.time
         const versions = parse_versions(_versions)

         res.status(200).json({
            success: true,
            data: {
               versions,
               name: data.name,
               author: data.author,
               homepage: data.homepage,
               description: data.description,
               github_url: data.repository.url
                  .replace('git+', '')
                  .replace('.git', ''),
            },
         })
      }
   } catch (error) {
      res.status(500).json({ success: false, error: error.message })
   }
}

const parse_versions = versions =>
   Object.entries(versions)
      .sort((a, b) => {
         const [, a_date] = a
         const [, b_date] = b
         return new Date(b_date).getTime() - new Date(a_date).getTime()
      })
      .map(([version]) => version)
