import tw from 'twin.macro'

import { Package } from './Package'

export const Packages = ({ packages = {}, setSelectedPackage }) => {
   if (Object.keys(packages).length === 0)
      return <span tw="text-white">No dependencies</span>
   return (
      <ul tw="border border-gray-700 rounded">
         {Object.keys(packages).map((key, index) => (
            <Package
               key={index}
               setSelectedPackage={setSelectedPackage}
               _package={{ name: key, version: packages[key] }}
            />
         ))}
      </ul>
   )
}
