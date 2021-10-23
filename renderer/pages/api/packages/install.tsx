import fs from 'fs'
import { exec } from 'child_process'

export default async function handler(req, res) {
   try {
      if (req.method === 'POST') {
         const {
            name = '',
            path = '',
            version = 'latest',
            isDevDependency = false,
         } = req.body

         if (!fs.existsSync(path)) {
            return res
               .status(400)
               .send({ error: `Path ${path} does not exist` })
         }

         let cmd = ''

         if (fs.existsSync(path + '/yarn.lock')) {
            cmd += 'yarn add '
         } else {
            cmd += 'npm install '
         }

         if (isDevDependency) {
            cmd += '-D'
         }

         const command = `${cmd} ${name}@${version}`

         const child = exec(command, { cwd: path })
         let output = ''
         child.stdout.on('data', data => {
            output += data
         })
         child.stderr.on('data', data => {
            output += data
         })
         child.on('close', () => {
            res.status(200).json({
               success: true,
               data: output,
            })
         })
      }
   } catch (error) {
      res.status(500).json({ success: false, error: error.message })
   }
}
