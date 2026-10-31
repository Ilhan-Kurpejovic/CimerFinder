export const roommateTags = [
  'Ne pušim',
  'Pet friendly',
  'Rad od kuće',
  'Miran dom',
  'Druženje',
  'Rano ustajem',
  'Noćna ptica',
]
const propertyTags = new Set(['Namješteno', 'Terasa', 'Wi-Fi', 'Blizu fakulteta'])
export function personalTags(tags: string[]) {
  return tags.filter((tag) => !propertyTags.has(tag))
}
