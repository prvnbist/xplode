// @ts-ignore
export const listFormatter = new Intl.ListFormat('en', {
   style: 'long',
   type: 'conjunction',
})

export const dateFormatter = new Intl.DateTimeFormat('en-US', {
   year: 'numeric',
   month: 'short',
   day: 'numeric',
})

export const formatContributors = (contributors: { name?: string }) => {
   if (!Array.isArray(contributors)) return ''
   if (contributors.length === 0) return ''

   const listWithValidNames = contributors.filter(c => c.name).map(c => c.name)

   if (listWithValidNames.length <= 3) return listFormatter.format(listWithValidNames)

   const namedContributors = [...listWithValidNames].slice(0, 2)
   const remainingContributorsCount = listWithValidNames.length - namedContributors.length

   return listFormatter.format([...namedContributors, `${remainingContributorsCount} other`])
}
