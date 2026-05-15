import { Link } from "react-router-dom"
import "./style.scss"
import WelcomeModal from "../../Component/WelcomeModal"
import { useEffect, useState } from "react"

const TermsConditions = () => {
  const [show, setShow] = useState(false)

  const isLoging = localStorage.getItem("welShow")

  const handleClose = () => {
    localStorage.removeItem("welShow")
    setShow(false)
  }
  const handleShow = () => setShow(true)

  useEffect(() => {
    if (isLoging === "true") {
      handleShow()
    }
  }, [isLoging])

  return (
    <>
      <div className="terms-page">
        <div className="terms-header">
          <h1>Terms & Conditions</h1>
        </div>

        <div className="terms-continue-btn">
          <Link to="/main">Continue</Link>
        </div>

        <div className="terms-content">
          <h2 className="terms-subtitle">कृपया नियमों को समझने के लिए यहाँ कुछ मिनट दें, और अपने अनुसार समझ लें।</h2>

          <div className="terms-note">NOTE:</div>

          <div className="terms-rules">
            <div className="rule-item">
              <span className="rule-number">1.</span>
              <span className="rule-text">सभी डीलर्स से निवेदन है कि क्लाइंट्स को साइट के रूल्स समझाने के बाद ही सौदे करवायें।</span>
            </div>

            <div className="rule-item">
              <span className="rule-number">2.</span>
              <span className="rule-text">अगर आप इस एग्रीमेंट को ऐक्सेप्ट नहीं करते है तो कोई सौदा नहीं कीजिये।</span>
            </div>

            <div className="rule-item">
              <span className="rule-number">3.</span>
              <span className="rule-text">सर्वर या वेबसाइट में किसी तरह की खराबी आने या बंद हो जाने पर केवल किए गए सौदे ही मान्य होंगे। ऐसी स्थिति में किसी तरह का वाद-विवाद मान्य नहीं होगा</span>
            </div>

            <div className="rule-item rule-long">
              <p>कंपनी के पास अधिकार है कि वे किसी भी ऐड/शर्तों को निलंबित/रद्द करें अगर यह गलतफहमी साबित होता है। उदहारण स्वरुप, वीपीएन/प्रॉक्सी/प्रोग्राम/सॉफ्टवेयर आदि इस्तेमाल करना।</p>
            </div>
          </div>

          <div className="terms-bottom-continue">
            <Link to="/main">Continue</Link>
          </div>
        </div>
      </div>
      <WelcomeModal show={show} handleClose={handleClose} />
    </>
  )
}

export default TermsConditions
