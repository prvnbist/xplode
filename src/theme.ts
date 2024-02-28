import { createTheme } from '@mantine/core'

const theme = createTheme({
   autoContrast: true,
   fontFamily: "'Inter Variable', sans-serif",
   headings: {
      fontWeight: '400',
      fontFamily: "'Unbounded Variable', sans-serif",
   },
   primaryShade: 4,
   primaryColor: 'yellow',
})

export default theme
