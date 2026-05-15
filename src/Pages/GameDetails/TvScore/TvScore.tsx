import React, { useState } from "react"
import { Link, useParams } from "react-router-dom"

const TvScore = () => {
  const { id } = useParams()
  const [showTv, setShowTv] = useState(false)
  return (
    <>
      <div className="menu text-center">
        <ul className="navMain">
          <li className="show-tv active" onClick={() => setShowTv(!showTv)}>
            <Link
              to="#"
              className="active text-center"
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
              }}
            >
              <img
                src="/img/tv.png"
                style={{ width: 23, marginRight: "2px" }}
                alt="tv"
              />
              <span>Show Tv </span>
            </Link>
          </li>
        </ul>
      </div>
      {showTv && (
        <div id="tvFrame" className="text-center">
          <iframe
            title="demo"
            width="100%"
            height="250"
            src={`https://mis2.sqmr.xyz/stv.php?eventId=${id}`}
          ></iframe>
        </div>
      )}
    </>
  )
}

export default TvScore
