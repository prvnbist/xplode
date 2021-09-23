import fs from 'fs'
import { exec } from 'child_process'

export default async function handler(req, res) {
   try {
      if (req.method === 'POST') {
         const { name = '', path = '' } = req.body

         if (!fs.existsSync(path)) {
            return res
               .status(400)
               .send({ error: `Path ${path} does not exist` })
         }

         let cmd = ''

         if (fs.existsSync(path + '/yarn.lock')) {
            cmd += 'yarn remove'
         } else {
            cmd += 'npm uninstall'
         }

         const command = `${cmd} ${name}`

         const child = exec(command, { cwd: path })
         child.on('close', () => {
            res.status(200).json({
               success: true,
            })
         })
      }
   } catch (error) {
      res.status(500).json({ success: false, error: error.message })
   }
}
