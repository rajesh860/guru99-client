import { Grid } from "@mui/material"
import CardComp from "../../Casino_Data/CardComp"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

const settings = {
  infinite: true,
  arrows: true,
  slidesToScroll: 1,
  slidesToShow: 11,
  responsive: [
    {
      breakpoint: 800,
      settings: {
        slidesToShow: 5
      }
    }
  ]
}

const AndarBharResult = ({ result }) => {
  const splitByStar = result[0]?.cards?.split("*")
  const finalResult = splitByStar.map(item => item.split(","))

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span style={{ fontSize: "14px" }}>
          <b style={{ fontSize: "17px" }}>Round Id: </b> {result[0]?.mid}
        </span>
      </div>

      <Grid container style={{ margin: "12px 0px" }}>
        <Grid item xs={12} md={12}>
          <div className="three-card-result-container">
            <div className="text-center">Andar</div>
            <div
              className="three-card-result result_slick"
              style={{ width: "100%" }}
            >
              <Slider {...settings}>
                {finalResult[0]?.map((item, id) => {
                  if (item === "") return null
                  return <CardComp key={id} shown={true} card={item} />
                })}
              </Slider>
            </div>
          </div>
        </Grid>
        <Grid item xs={12} md={12}>
          <div className="three-card-result-container">
            <div className="text-center">Bahar</div>
            <div className="three-card-result result_slick">
              <Slider {...settings}>
                {finalResult[1]?.map((item, id) => {
                  if (item === "") return null
                  return <CardComp key={id} shown={true} card={item} />
                })}
              </Slider>
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  )
}

export default AndarBharResult
