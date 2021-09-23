import tw from 'twin.macro'

import { IPackageProps } from '../types'
import * as Icon from '../assets/icons'

export const Package = ({ _package, setSelectedPackage }: IPackageProps) => {
   return (
      <li tw="flex px-3 h-10 items-center border-b border-gray-700 last:border-0">
         <span
            title={_package.name}
            tw="truncate text-gray-400 block w-[340px] pr-2"
         >
            {_package.name}
         </span>
         <span title={_package.version} tw="text-yellow-200 pr-2">
            {_package.version}
         </span>
         <button
            className="group"
            title="Edit Package"
            onClick={() => setSelectedPackage(_package)}
            tw="flex-shrink-0 ml-auto rounded flex items-center justify-center h-8 w-8 hover:(bg-gray-700)"
         >
            <Icon.Edit
               size={18}
               tw="stroke-current text-gray-600 group-hover:(text-gray-300)"
            />
         </button>
      </li>
   )
}
