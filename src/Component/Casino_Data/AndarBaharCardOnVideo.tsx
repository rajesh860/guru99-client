import React, { useEffect, useMemo, useState } from "react"
import CardComp from "./CardComp"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import { Navigation } from "swiper/modules"

const AndarBaharCardOnVideo = ({ t3 }: any) => {
  const [aallSwiper, setAallSwiper] = useState(null)
  const [ballSwiper, setBallSwiper] = useState(null)

  const ball = useMemo(
    () => (t3 && t3[0]?.ball ? t3[0]?.ball.split(",") : []),
    [t3],
  )
  const aall = useMemo(
    () => (t3 && t3[0]?.aall ? t3[0]?.aall.split(",") : []),
    [t3],
  )

  useEffect(() => {
    if (aallSwiper && aall.length >= 1) {
      aallSwiper.slideTo(aall.length - 1)
    }
  }, [aall, aallSwiper])

  useEffect(() => {
    if (ballSwiper && ball.length >= 1) {
      ballSwiper.slideTo(ball.length - 1)
    }
  }, [ball, ballSwiper])

  return (
    <>
      {t3 && (t3[0]?.ball || t3[0]?.aall) && (
        <div className="card_shown_on_top card_shown_on_top_andar_bahar">
          <div className="round_id">Andar</div>
          <div>
            <Swiper
              onSwiper={setAallSwiper} // Capture the Swiper instance
              spaceBetween={2}
              slidesPerView={3}
              navigation={true}
              modules={[Navigation]}
              // autoplay={{
              //   delay: 2500,
              // }}
              className="mySwiper"
            >
              {aall.map((sid: any, id: number) => (
                <SwiperSlide key={id}>
                  <CardComp shown={true} card={sid} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="round_id">Bahar</div>
          <div>
            <Swiper
              onSwiper={setBallSwiper}
              spaceBetween={2} // Capture the Swiper instance
              slidesPerView={3}
              navigation={true}
              modules={[Navigation]}
              // autoplay={{
              //   delay: 2500,
              // }}
              className="mySwiper"
            >
              {ball.map((sid: any, id: number) => (
                <SwiperSlide key={id}>
                  <CardComp shown={true} card={sid} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </>
  )
}

export default AndarBaharCardOnVideo
