import fs from 'fs'
import axios from 'axios'

export default async function handler(req, res) {
   try {
      if (req.method === 'GET') {
         const { path = '' } = req.query
         const packages = fs.readFileSync(path, 'utf-8')
         const { dependencies = {}, devDependencies = {} } =
            JSON.parse(packages)

         const NPM_API = 'https://registry.npmjs.org'

         const deps = await Promise.all(
            Object.keys(dependencies).map(async name => {
               const { data } = await axios(`${NPM_API}/${name}`)
               const { created, modified, ..._versions } = data.time
               const versions = parse_versions(_versions)
               return { name, installed: dependencies[name], versions }
            })
         )

         const dev_deps = await Promise.all(
            Object.keys(devDependencies).map(async name => {
               const { data } = await axios(`${NPM_API}/${name}`)
               const { created, modified, ..._versions } = data.time
               const versions = parse_versions(_versions)
               return { name, installed: devDependencies[name], versions }
            })
         )
         res.status(200).json({
            success: true,
            data: { dependencies: deps, devDependencies: dev_deps },
         })
      }
   } catch (error) {
      res.status(500).json({ success: false, error: error.message })
   }
}

const hasLettersRegex = new RegExp(/^[^a-zA-Z]*$/)

const parse_versions = versions =>
   Object.entries(versions)
      .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
      .map(([version]) => version)
      .filter(version => hasLettersRegex.test(version))
