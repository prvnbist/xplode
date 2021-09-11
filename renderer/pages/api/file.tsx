import fs from 'fs'

export default async function handler(req, res) {
   try {
      if (req.method === 'GET') {
         const { path = '' } = req.query
         const packages = fs.readFileSync(path, 'utf-8')
         res.status(200).json({
            success: true,
            data: JSON.parse(packages),
         })
      }
   } catch (error) {
      res.status(500).json({ success: false, error: error.message })
   }
}
