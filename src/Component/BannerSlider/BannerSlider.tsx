import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import "./BannerSlider.scss"

const BANNERS = [
  // "/banner/banner-1.gif",
  "/banner/banner-2.webp",
  "/banner/banner-3.webp",
]

const BannerSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    arrows: false,
    dotsClass: "bnr-dots",
    customPaging: () => <button className="bnr-dot" />,
  }

  return (
    <div className="bnr">
      <Slider {...settings}>
        {BANNERS.map((src, i) => (
          <div key={i} className="bnr-slide">
            <img src={src} alt={`banner-${i + 1}`} className="bnr-img" />
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default BannerSlider