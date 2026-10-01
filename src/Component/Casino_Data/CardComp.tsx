import "./card.scss"
const CardComp = ({ shown, card }: any) => {
  return (
    <>
      <div className={`flip-card ${shown}`}>
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <img className="card_back" src="/img/cardBack.png" alt="" />
          </div>
          <div className="flip-card-back">
            <img
              className="card_front"
              src={`https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${card}.jpg`}
              alt=""
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default CardComp
