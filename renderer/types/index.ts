export interface IFileState {
   name?: string
   dependencies?: {
      string: string
   }
   devDependencies?: {
      string: string
   }
}

export interface IPackageDetailsState {
   versions?: [string]
   name?: string
   author?: {
      name?: string
      email?: string
   }
   homepage?: string
   description?: string
   github_url?: string
   isDevDependency?: boolean
}

export interface IPackageProps {
   _package: { name: string; version: string }
   setSelectedPackage: (input: { name: string; version: string }) => void
}

export interface IPackageDetailsProps {
   path: string
   loading: boolean
   installed: string
   closeModal: () => void
   details: IPackageDetailsState
   fetch_file: (path: string) => void
}
