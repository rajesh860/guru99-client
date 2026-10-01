export const getCardImage = (cardCode?: string): string => {
  if (!cardCode || cardCode === "1") {
    return "https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/1.jpg"
  }
  const mapped = cardCode
  return `https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${mapped}.jpg`
}
