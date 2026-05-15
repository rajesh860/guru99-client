import { Box, Grid, Typography } from "@mui/material"
import { FaTrophy } from "react-icons/fa"
import CardComp from "../../Casino_Data/CardComp"

interface ResultModalContent3CardProps {
  result: any[]
}

const ResultModalContent3Card = ({ result }: ResultModalContent3CardProps) => {
  const round = result?.[0]
  const cardArr = round?.cards?.split(",") || []

  return (
    <div className="casino-result-modal">
      {/* Round Info */}
      <div className="casino-result-round-id">
        <Typography variant="body2">
          <b style={{ fontSize: "17px" }}>Round Id: </b> {round?.mid}
        </Typography>
      </div>

      {/* Players */}
      <Grid container spacing={2}>
        {/* Player A */}
        <Grid item xs={12} md={6}>
          <div className="three-card-result-container">
            <Typography align="center">Player A</Typography>
            <div className="three-card-result">
              <CardComp shown card={cardArr[0]} />
              <CardComp shown card={cardArr[2]} />
              <CardComp shown card={cardArr[4]} />
              {round?.win === "1" && (
                <FaTrophy className="tropth_win trophyIcon" />
              )}
            </div>
          </div>
        </Grid>

        {/* Player B */}
        <Grid item xs={12} md={6}>
          <div className="three-card-result-container">
            <Typography align="center">Player B</Typography>
            <div className="three-card-result">
              <CardComp shown card={cardArr[1]} />
              <CardComp shown card={cardArr[3]} />
              <CardComp shown card={cardArr[5]} />
              {/* {round?.win !== "1" && (
                <FaTrophy className="tropth_win trophyIcon trophyIcon1" />
              )} */}
            </div>
          </div>
        </Grid>
      </Grid>

      {/* Winner Info */}
      <Box mt={2}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <div className="casino-result-desc">
              <div className="casino-result-desc-item">
                <div>Winner:</div>
                <div className="font_bold">
                  {round?.win === "1" ? "Player A" : "Player B"}
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default ResultModalContent3Card