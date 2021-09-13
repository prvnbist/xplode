import React from 'react'
import Head from 'next/head'
import axios from 'axios'
import tw from 'twin.macro'
import Modal from 'react-modal'
import Select from 'react-select'

import * as Icon from '../assets/icons'

interface IFileState {
   dependencies?: {
      string: string
   }
   devDependencies?: {
      string: string
   }
}

interface IPackageDetailsState {
   versions?: [string]
   name?: string
   author?: {
      name?: string
      email?: string
   }
   homepage?: string
   description?: string
   github_url?: string
   isDevDependency: boolean
}

function Home() {
   const [path] = React.useState('C:\\code\\projects\\tags')
   const [file, setFile] = React.useState<IFileState>({})
   const [packageDetails, setPackageDetails] =
      React.useState<IPackageDetailsState>({})
   const [selectedPackage, setSelectedPackage] = React.useState<{
      name: string
      version: string
   }>({ name: '', version: '' })
   const [packageDetailsLoading, setPackageDetailsLoading] =
      React.useState<boolean>(false)

   React.useEffect(() => {
      ;(async () => {
         const { success, data } = await get_file(path)
         if (success) {
            setFile(data)
         }
      })()
   }, [path])

   const fetch_package = async () => {
      setPackageDetailsLoading(true)
      if (selectedPackage?.name) {
         const { success, data } = await get_package(selectedPackage.name)
         if (success) {
            setPackageDetails({
               ...data,
               isDevDependency:
                  file.devDependencies?.hasOwnProperty(selectedPackage.name) ??
                  false,
            })
         }
      }
      setPackageDetailsLoading(false)
   }

   const closeModal = () => {
      setSelectedPackage({ name: '', version: '' })
      setPackageDetails({})
   }

   return (
      <React.Fragment>
         <Head>
            <title>Home</title>
         </Head>
         <main tw="p-3">
            <h2 tw="text-lg mb-2 text-white">Dependencies</h2>
            {file?.dependencies ? (
               <ul tw="py-1 border border-gray-700 rounded">
                  {Object.keys(file.dependencies).map((key, index) => (
                     <Package
                        key={index}
                        setSelectedPackage={setSelectedPackage}
                        _package={{
                           name: key,
                           version: file.dependencies[key],
                        }}
                     />
                  ))}
               </ul>
            ) : (
               <span>No dependencies</span>
            )}
            <h2 tw="text-lg mt-4 mb-1 text-white">Dev Dependencies</h2>
            {file?.devDependencies ? (
               <ul tw="py-1 border border-gray-700 rounded">
                  {Object.keys(file.devDependencies).map((key, index) => (
                     <Package
                        key={index}
                        setSelectedPackage={setSelectedPackage}
                        _package={{
                           name: key,
                           version: file.devDependencies[key],
                        }}
                     />
                  ))}
               </ul>
            ) : (
               <span>No dev dependencies</span>
            )}
         </main>
         <Modal
            isOpen={Boolean(selectedPackage?.name)}
            onAfterOpen={fetch_package}
            shouldCloseOnOverlayClick={true}
            onAfterClose={closeModal}
            onRequestClose={closeModal}
            contentElement={(props, children) => (
               <div {...props} tw="!border-0 !bg-gray-900">
                  {children}
               </div>
            )}
         >
            <PackageDetails
               path={path}
               closeModal={closeModal}
               details={packageDetails}
               loading={packageDetailsLoading}
               installed={selectedPackage.version}
            />
         </Modal>
      </React.Fragment>
   )
}

export default Home

const get_file = async path => {
   try {
      const { status, data } = await axios.get('/api/file', {
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

const get_package = async name => {
   try {
      const { status, data } = await axios.get(`/api/packages/${name}`)
      if (status === 200) {
         if (data.success) {
            return { success: true, data: data.data }
         } else {
            return { success: false, error: data.error }
         }
      } else {
         return {
            success: false,
            error: "Failed to fetch package's details.",
         }
      }
   } catch (error) {
      return { success: false, error: error.message }
   }
}

interface IPackageProps {
   _package: { name: string; version: string }
   setSelectedPackage: (name: string) => void
}

const Package = ({ _package, setSelectedPackage }: IPackageProps) => {
   return (
      <li tw="flex px-3 h-10 items-center border-b border-gray-700 last:border-0">
         <span tw="text-gray-400 block w-[240px]">{_package.name}</span>
         <span tw="text-gray-400">{_package.version}</span>
         <button
            className="group"
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

interface IPackageDetailsProps {
   path: string
   loading: boolean
   installed: string
   closeModal: () => void
   details: IPackageDetailsState
}

const _DropdownIndicator = ({ isFocused }) => {
   return (
      <button tw="flex items-center justify-center w-8">
         {isFocused ? (
            <Icon.Up size={20} tw="stroke-current text-gray-800" />
         ) : (
            <Icon.Down size={20} tw="stroke-current text-gray-800" />
         )}
      </button>
   )
}

const PackageDetails = ({
   path,
   loading,
   closeModal,
   details,
   installed,
}: IPackageDetailsProps) => {
   const [installing, setInstalling] = React.useState(false)
   const [logs, setLogs] = React.useState<string>('')
   const [selectedVersion, setSelectedVersion] = React.useState<string>('')
   const versions =
      details?.versions?.map(version => ({
         value: version,
         label: version,
      })) || []

   const update_version = async () => {
      try {
         setInstalling(true)
         const { status, data } = await axios.post('/api/packages/install', {
            path,
            name: details.name,
            version: selectedVersion,
            isDevDependency: details.isDevDependency,
         })
         if (status === 200) {
            if (data.success) {
               setLogs(data.data)
            } else {
               throw new Error(data.error)
            }
         }
         setInstalling(false)
      } catch (error) {
         setInstalling(false)
         console.log('Failed to install the package version!')
      }
   }

   return (
      <>
         <header tw="h-12 pl-3 pr-2 flex items-center justify-between">
            <span tw="text-white">{details.name}</span>
            <button
               onClick={closeModal}
               tw="h-8 w-8 rounded hover:bg-gray-700 flex items-center justify-center"
            >
               <Icon.Close size={18} tw="stroke-current text-white" />
            </button>
         </header>
         <main tw="px-3">
            {loading ? (
               <span tw="flex text-center text-white">Loading...</span>
            ) : (
               <>
                  {' '}
                  <section tw="mb-3">
                     <span tw="uppercase font-medium text-sm text-gray-500 tracking-wider">
                        Description:{' '}
                     </span>
                     <p tw="text-gray-400">{details?.description}</p>
                  </section>
                  {details?.author && (
                     <section tw="mb-3">
                        <div tw="flex items-center gap-2">
                           {details?.author?.name && (
                              <div tw="text-yellow-300 text-sm font-light h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                                 {details?.author?.name
                                    .match(/(^\S\S?|\b\S)?/g)
                                    .join('')
                                    .match(/(^\S|\S$)?/g)
                                    .join('')
                                    .toUpperCase()}
                              </div>
                           )}
                           <div tw="flex flex-col">
                              {details?.author?.name && (
                                 <span tw="text-gray-400">
                                    {details?.author?.name}
                                 </span>
                              )}
                              {details?.author?.email && (
                                 <span tw="text-gray-400 text-sm">
                                    {details?.author?.email}
                                 </span>
                              )}
                           </div>
                        </div>
                     </section>
                  )}
                  <section tw="mb-3">
                     <span tw="uppercase font-medium text-sm text-gray-500 tracking-wider">
                        Homepage:{' '}
                     </span>
                     <a
                        target="_blank"
                        href={details?.homepage}
                        rel="noopener noreferrer"
                        tw="text-blue-300"
                     >
                        {details?.homepage}
                     </a>
                  </section>
                  <section tw="mb-3">
                     <span tw="uppercase font-medium text-sm text-gray-500 tracking-wider">
                        Github:{' '}
                     </span>
                     <a
                        target="_blank"
                        href={details?.github_url}
                        rel="noopener noreferrer"
                        tw="text-blue-300"
                     >
                        {details?.github_url}
                     </a>
                  </section>
                  <section tw="mb-3">
                     <span tw="block mb-2 uppercase font-medium text-sm text-gray-500 tracking-wider">
                        Versions:{' '}
                     </span>
                     <Select
                        components={{
                           DropdownIndicator: _DropdownIndicator,
                        }}
                        defaultValue={{
                           value: installed.replace('^', ''),
                           label: installed.replace('^', ''),
                        }}
                        onChange={({ value }) => {
                           setLogs('')
                           setSelectedVersion(value)
                        }}
                        options={versions}
                        styles={{
                           dropdownIndicator: styles => {
                              return { ...styles, color: '#000' }
                           },
                           option: (styles, { isDisabled, isSelected }) => {
                              return {
                                 ...styles,
                                 color: isDisabled
                                    ? '#ccc'
                                    : isSelected
                                    ? '#fff'
                                    : '#000',
                              }
                           },
                        }}
                     />
                     {selectedVersion &&
                        selectedVersion !== installed.replace('^', '') && (
                           <button
                              disabled={installing}
                              onClick={update_version}
                              tw="mt-2 w-full bg-green-500 text-white h-10 rounded disabled:(bg-gray-600 text-black)"
                           >
                              {installing
                                 ? `Updating to v${selectedVersion}`
                                 : `Update to v${selectedVersion}`}
                           </button>
                        )}

                     {logs && (
                        <>
                           <span tw="mt-3 mb-2 block uppercase font-medium text-sm text-gray-500 tracking-wider">
                              Logs:{' '}
                           </span>
                           <pre tw="w-full overflow-x-auto">
                              <code tw="text-white">{logs}</code>
                           </pre>
                        </>
                     )}
                  </section>
               </>
            )}
         </main>
      </>
   )
}
