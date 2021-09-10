import React from 'react'
import Head from 'next/head'
import axios from 'axios'
import tw from 'twin.macro'

function Home() {
   const [dependencies, setDependencies] = React.useState([])
   const [devDependencies, setDevDependencies] = React.useState([])

   React.useEffect(() => {
      ;(async () => {
         const { success, data } = await get_packages(
            'C:\\code\\projects\\xplode\\package.json'
         )
         if (success) {
            setDependencies(data.dependencies)
            setDevDependencies(data.devDependencies)
         }
      })()
   }, [])

   return (
      <React.Fragment>
         <Head>
            <title>Home</title>
         </Head>
         <main tw="p-3">
            <h2 tw="text-lg mb-2">Dependencies</h2>
            <ul tw="py-1 border border-gray-700 rounded">
               {Object.keys(dependencies).map((key, index) => (
                  <Package key={index} _package={dependencies[key]} />
               ))}
            </ul>
            <h2 tw="text-lg mt-4 mb-1">Dev Dependencies</h2>
            <ul tw="py-1 border border-gray-700 rounded">
               {Object.keys(devDependencies).map((key, index) => (
                  <Package key={index} _package={devDependencies[key]} />
               ))}
            </ul>
         </main>
      </React.Fragment>
   )
}

export default Home

const get_packages = async path => {
   try {
      const { status, data } = await axios.get('/api/packages', {
         params: { path },
      })
      if (status === 200) {
         if (data.success) {
            return { success: true, data: data.data }
         } else {
            return { success: false, error: data.error }
         }
      } else {
         return {
            success: false,
            error: "Failed to fetch package file's content.",
         }
      }
   } catch (error) {
      return { success: false, error: error.message }
   }
}

interface IPackageProps {
   _package: { name: string; installed: string; versions: [string] }
}

const Package = ({ _package }: IPackageProps) => {
   return (
      <li tw="flex px-3 h-8 items-center hover:bg-gray-800 border-b border-gray-700 last:border-0">
         <span tw="text-gray-400 block w-[220px]">{_package.name}</span>
         <select
            tw="px-1 h-6 rounded text-sm bg-transparent flex-1 w-full border border-gray-800"
            name={_package.name + '_versions'}
            id={_package.name + '_versions'}
         >
            {_package.versions.map(version => (
               <option key={version} value={version} tw="text-black">
                  {version}
               </option>
            ))}
         </select>
      </li>
   )
}
