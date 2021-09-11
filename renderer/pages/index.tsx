import React from 'react'
import Head from 'next/head'
import axios from 'axios'
import tw from 'twin.macro'
import Modal from 'react-modal'

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
}

function Home() {
   const [file, setFile] = React.useState<IFileState>({})
   const [packageDetails, setPackageDetails] =
      React.useState<IPackageDetailsState>({})
   const [selectedPackage, setSelectedPackage] = React.useState<string>('')
   const [packageDetailsLoading, setPackageDetailsLoading] =
      React.useState<boolean>(false)

   React.useEffect(() => {
      ;(async () => {
         const { success, data } = await get_file(
            'C:\\code\\projects\\xplode\\package.json'
         )
         if (success) {
            setFile(data)
         }
      })()
   }, [])

   const fetch_package = async () => {
      setPackageDetailsLoading(true)
      if (selectedPackage.trim()) {
         const { success, data } = await get_package(selectedPackage)
         if (success) {
            setPackageDetails(data)
         }
      }
      setPackageDetailsLoading(false)
   }

   const closeModal = () => {
      setSelectedPackage('')
      setPackageDetails({})
   }

   return (
      <React.Fragment>
         <Head>
            <title>Home</title>
         </Head>
         <main tw="p-3">
            <h2 tw="text-lg mb-2">Dependencies</h2>
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
            <h2 tw="text-lg mt-4 mb-1">Dev Dependencies</h2>
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
            isOpen={selectedPackage}
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
               loading={packageDetailsLoading}
               closeModal={closeModal}
               details={packageDetails}
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
            onClick={() => setSelectedPackage(_package.name)}
            tw="ml-auto rounded flex items-center justify-center h-8 w-8 hover:(bg-gray-700)"
         >
            <Icon.Edit size={18} tw="stroke-current" />
         </button>
      </li>
   )
}

interface IPackageDetailsProps {
   loading: boolean
   closeModal: () => void
   details: IPackageDetailsState
}

const PackageDetails = ({
   loading,
   closeModal,
   details,
}: IPackageDetailsProps) => {
   return (
      <>
         <header tw="h-12 pl-3 pr-2 flex items-center justify-between">
            <span>{details.name}</span>
            <button
               onClick={closeModal}
               tw="h-8 w-8 rounded hover:bg-gray-700 flex items-center justify-center"
            >
               <Icon.Close size={18} tw="stroke-current" />
            </button>
         </header>
         <main tw="px-3">
            {loading ? (
               <span>Loading...</span>
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
                              <div tw="text-sm font-light h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
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
               </>
            )}
         </main>
      </>
   )
}
