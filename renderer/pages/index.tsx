import React from 'react'
import axios from 'axios'
import tw from 'twin.macro'
import Head from 'next/head'
import Modal from 'react-modal'
import { ipcRenderer } from 'electron'

import * as Icon from '../assets/icons'
import * as Illustration from '../assets/illustrations'
import { PackageModal, Packages } from '../components'
import { IFileState, IPackageDetailsState } from '../types'

function Home() {
   const [path, setPath] = React.useState('')
   const [file, setFile] = React.useState<IFileState>({})
   const [packageDetails, setPackageDetails] =
      React.useState<IPackageDetailsState>({})
   const [selectedPackage, setSelectedPackage] = React.useState<{
      name: string
      version: string
   }>({ name: '', version: '' })
   const [packageDetailsLoading, setPackageDetailsLoading] =
      React.useState<boolean>(false)

   const fetch_file = React.useCallback(async path => {
      try {
         const { success, data } = await get_file(path)
         if (success) {
            setFile(data)
         }
      } catch (error) {
         console.log(error)
      }
   }, [])

   React.useEffect(() => {
      if (path) {
         fetch_file(path)
      }
   }, [path, fetch_file])

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
         <header tw="flex items-center justify-between h-12 border-b border-gray-700">
            <aside tw="flex">
               <button
                  title="Select Project"
                  tw="bg-green-400 ml-2 h-8 w-8 rounded flex items-center justify-center"
                  onClick={() => {
                     ipcRenderer
                        .invoke('select-folder-window')
                        .then(setPath)
                        .catch(console.log)
                  }}
               >
                  <Icon.Add size={22} tw="stroke-current text-white" />
               </button>
               {file?.name && (
                  <h3
                     title={'Project: ' + file?.name}
                     tw="ml-3 text-lg text-white"
                  >
                     {file?.name}
                  </h3>
               )}
            </aside>
            <button
               title="Close Project"
               tw="flex-shrink-0 border border-red-400 mr-2 h-8 w-8 rounded flex items-center justify-center"
               onClick={() => {
                  setFile({})
                  setPath('')
               }}
            >
               <Icon.Close size={22} tw="stroke-current text-white" />
            </button>
         </header>
         {!path.trim() ? (
            <section tw="mt-8 flex flex-col items-center">
               <div>
                  <Illustration.Empty />
               </div>
               <p tw="mt-4 text-center text-white">
                  Start by selecting a folder!
               </p>
            </section>
         ) : (
            <>
               <main tw="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <section>
                     <h2 tw="mb-3 text-lg text-white">Dependencies</h2>
                     <Packages
                        packages={file?.dependencies || {}}
                        setSelectedPackage={setSelectedPackage}
                     />
                  </section>
                  <section>
                     <h2 tw="mb-3 text-lg text-white">Dev Dependencies</h2>
                     <Packages
                        packages={file.devDependencies || {}}
                        setSelectedPackage={setSelectedPackage}
                     />
                  </section>
               </main>
               <Modal
                  onAfterClose={closeModal}
                  onAfterOpen={fetch_package}
                  onRequestClose={closeModal}
                  shouldCloseOnOverlayClick={true}
                  isOpen={Boolean(selectedPackage?.name)}
                  contentElement={(props, children) => (
                     <div {...props} tw="!border-0 !bg-gray-900">
                        {children}
                     </div>
                  )}
               >
                  <PackageModal
                     path={path}
                     closeModal={closeModal}
                     fetch_file={fetch_file}
                     details={packageDetails}
                     loading={packageDetailsLoading}
                     installed={selectedPackage.version}
                  />
               </Modal>
            </>
         )}
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
