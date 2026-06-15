import type React from "react";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./styles.scss";
import PlaceBetModal from "../../betPlaceModal";
import { useBetPlaceMutation } from "../../../../store/service/casino/casinoServices";
import snackbarUtil from "../../../utils/Snackbar";

interface RateTableProps {
  splitAll: string[];
  splitBll: string[];
}

const RateTable: React.FC<RateTableProps> = ({ splitAll, splitBll }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [cardState, setCardState] = useState({
    andr: [] as string[],
    bhr: [] as string[],
  });
  
  useEffect(() => {
    setCardState((prev) => ({
      ...prev,
      andr: [...splitAll],
      bhr: [...splitBll],
    }));
  }, [splitAll, splitBll]);
  const [trigger, { data: betPlaceResponse }] = useBetPlaceMutation();

  const handleRateClick = (item: string) => {
    setSelectedPlayer(item);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleModalSubmit = (data: any) => {
    trigger(data);
  };

  useEffect(() => {
    if (betPlaceResponse) {
      if (betPlaceResponse?.success ?? betPlaceResponse?.status) {
        snackbarUtil.success(betPlaceResponse.message);
        setModalVisible(false);
      } else {
        snackbarUtil.error(betPlaceResponse.message);
      }
    }
  }, [betPlaceResponse]);
  // const cardSrc = ⁠ /img/CARD ${br.length ? (br.includes( ⁠${sid}⁠ ) ? cardNation : "0") : cardNation}.png ⁠;
  const renderCards = (items: string[], type: "Ander" | "Baher") => {
    return items?.map((item, index) => (
      <div
        key={`${type}-${index}`}
        className="card-wrapper slide-gap"
        onClick={() => handleRateClick(`${type}-${item}`)}
      >
        <img
          src={`/casino/CARD ${item}.png`}
          alt="card"
          style={{width:"50px"}}
        />
        <div className="card-pnl">{item}</div>
      </div>
    ));
  };

  const sliderSettings = {
    infinite: false,
    speed: 500,
    slidesToShow: 13,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
        },
      },
    ],
  };

  return (
    <div className="rate-table-container">
      <div className="table-section">
        <div className="table-row ander">
          <div className="label">Ander</div>
          <div className="cards">
            <Slider  {...sliderSettings}>{renderCards(cardState?.andr, "Ander")}</Slider>
          </div>
        </div>
        <div className="table-row baher">
          <div className="label">Baher</div>
          <div className="cards">
            <Slider {...sliderSettings}>{renderCards(cardState?.bhr, "Baher")}</Slider>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default RateTable;
