import { Box, Grid } from "@mui/material"
import { FaTrophy } from "react-icons/fa"
import CardComp from "../Casino_Data/CardComp"

const AAAResult = ({ result, id }) => {
  const cardArr = result[0]?.cards?.split(",")
  console.log(cardArr)
  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span style={{ fontSize: "14px" }}>
          <b style={{ fontSize: "17px" }}>Round Id: </b> {result[0]?.mid}
        </span>
      </div>

      <Grid container>
        <Grid xs={12} md={12}>
          <div className=" three-card-result-container">
            {/* <div className="text-center">Dragon</div> */}
            <div className=" three-card-result">

              <CardComp shown={true} card={cardArr[0]} />

            </div>
            <div></div>
          </div>
        </Grid>
        {/* <Grid xs={12} md={6}>
          <div className="w-50 three-card-result-container">
            <div className="text-center">Tiger</div>
            <div className="three-card-result">
              <CardComp shown={true} card={cardArr[1]} />


              <div>{result[0]?.win !== "1" && <FaTrophy className="tropth_win trophyIcon trophyIcon1" />}</div>
            </div>
          </div>
        </Grid> */}
      </Grid>
      <Box>
        <Grid container justifyContent={"center"}>
          <Grid xs={12} md={6}>
            <div className="casino-result-desc">
              <div className="casino-result-desc-item">
                <div>Winner: </div>
                <div className="font_bold">{result[0]?.desc.split("|")[0]}</div>
              </div>
              {id === "55" ? (
                <>
                  <div className="casino-result-desc-item">
                    <div>Odd: </div>
                    <div className="font_bold">
                      {result[0]?.desc.split("|")[1] === "Even" ? "No" : "Yes"}
                    </div>
                  </div>
                  <div className="casino-result-desc-item">
                    <div>Dulha Dulhan/Barati: </div>
                    <div className="font_bold">
                      {result[0]?.desc.split("|")[3]}
                    </div>
                  </div>
                  <div className="casino-result-desc-item">
                    <div>Color: </div>
                    <div className="font_bold">
                      {result[0]?.desc.split("|")[2]}
                    </div>
                  </div>
                </>
              ) : id === "53" ? (
                <>
                  <div className="casino-result-desc-item">
                    <div>Odd/Even: </div>
                    <div className="font_bold">
                      {result[0]?.desc.split("||")[2]}
                    </div>
                  </div>
                  <div className="casino-result-desc-item">
                    <div>Color: </div>
                    <div className="font_bold">
                      {result[0]?.desc.split("||")[1]}
                    </div>
                  </div>

                  <div className="casino-result-desc-item">
                    <div>Card: </div>
                    <div className="font_bold">
                      {result[0]?.desc.split("||")[3]}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="casino-result-desc-item">
                    <div>Card: </div>
                    <div className="font_bold">
                      {result[0]?.desc.split("|")[2]}
                    </div>
                  </div>
                  <div className="casino-result-desc-item">
                    <div>Color: </div>
                    <div className="font_bold">
                      {result[0]?.desc.split("|")[1]}
                    </div>
                  </div>
                  <div className="casino-result-desc-item">
                    <div>Under/Over: </div>
                    <div>{result[0]?.desc.split("|")[3]}</div>
                  </div>
                </>
              )}
            </div>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default AAAResult
