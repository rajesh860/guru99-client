import './style.scss'

const CommonLodding = () => {
  return (
    <div id='pause' className="d-flex align-items-center justify-content-center">
      <div id="spinner" />
      <span style={{ color: "white", marginTop: "6rem" }}>Please Wait....</span>
    </div>
  )
}

export default CommonLodding
