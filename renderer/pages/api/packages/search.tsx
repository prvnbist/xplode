import axios from 'axios'

export default async function handler(req, res) {
   try {
      if (req.method === 'GET') {
         const { package: _package = '' } = req.query

         if (_package) {
            try {
               const result = await axios.get(`https://registry.npmjs.com/-/v1/search?text=${_package}&size=10`)
               if (result.status === 200) {
                  const list = result.data.objects.map(({ package: __package }) => {
                     const { name, author, description } = __package
                     return { name, author, description }
                  })
                  return res.status(200).json(list || [])
               }
            } catch (error) {
               return res.status(500).json({ success: false, message: 'Something went wrong!' })
            }
         }
         return res.status(200).json([])
      }
   } catch (error) {
      res.status(500).json({ success: false, error: error.message })
   }
}
