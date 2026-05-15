export const formatToDecimal = (number) => {
  return typeof number === 'number' ? Number(number / 100)?.toFixed(2) : number
}