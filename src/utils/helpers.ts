export const formatToDecimal = (number) => {
  return typeof number === 'number' ? Number(number / 100)?.toFixed(2) : number
}

export const formatLimit = (value) => {
  const num = Number(value) || 0
  if (num >= 100000) {
    const lakhs = num / 100000
    return `${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)}L`
  }
  if (num >= 1000) {
    const thousands = num / 1000
    return `${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`
  }
  return `${num}`
}