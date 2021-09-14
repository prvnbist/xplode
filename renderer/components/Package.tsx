import tw from 'twin.macro'

import { IPackageProps } from '../types'
import * as Icon from '../assets/icons'

export const Package = ({ _package, setSelectedPackage }: IPackageProps) => {
   return (
      <li tw="flex px-3 h-10 items-center border-b border-gray-700 last:border-0">
         <span title={_package.name} tw="text-gray-400 block w-[380px]">
            {_package.name}
         </span>
         <span title={_package.version} tw="text-gray-400">
            {_package.version}
         </span>
         <button
            className="group"
            title="Edit Package"
            onClick={() => setSelectedPackage(_package)}
            tw="ml-auto rounded flex items-center justify-center h-8 w-8 hover:(bg-gray-700)"
         >
            <Icon.Edit
               size={18}
               tw="stroke-current text-gray-600 group-hover:(text-gray-300)"
            />
         </button>
      </li>
   )
}
