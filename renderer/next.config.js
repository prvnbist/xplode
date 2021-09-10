module.exports = {
   webpack5: true,
   webpack: (config, { isServer }) => {
      config.resolve.fallback = { fs: false, module: false }
      if (!isServer) {
         config.target = 'electron-renderer'
         config.node = {
            __dirname: true,
         }
      }

      return config
   },
   typescript: {
      ignoreBuildErrors: true,
   },
}
