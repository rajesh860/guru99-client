import "./style.scss"
import { Modal } from "react-bootstrap"

interface Props {
  show: boolean
  handleClose: any
}

const WelcomeModal = ({ show, handleClose }: Props) => {
  const domainName = window.location.hostname

  return (
    <>
      <Modal
        size="xl"
        show={show}
        onHide={handleClose}
        dialogClassName="welcome_modal"
        className="welcome"
      >
        <Modal.Header>
          <span className="close" onClick={handleClose}>
            ×
          </span>
          <h2>&nbsp;&nbsp;&nbsp;Welcome To</h2>
          <h2>{domainName}</h2>
        </Modal.Header>
        <Modal.Body>
          <h6>
            अगर कोई सेशन रनिंग मै चल रहा है और टीम जीत जाती है या आलआउट हो जाती
            है तो सेशन डिक्लेअर होगा।
          </h6>
        </Modal.Body>
        <Modal.Footer>
          <h3>Thanks For Visiting Our Site</h3>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default WelcomeModal
