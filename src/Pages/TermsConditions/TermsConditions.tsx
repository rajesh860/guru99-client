import { Link } from "react-router-dom"
import "./style.scss"
import {
  FaExclamationTriangle,
  FaClock,
  FaChartLine,
  FaBook,
  FaDice,
  FaListOl,
  FaBaseballBall,
  FaCalendarAlt,
  FaCalendarDay,
  FaBolt,
  FaPlusCircle,
  FaUserInjured,
  FaFlagCheckered,
  FaHourglassHalf,
  FaBullseye,
  FaStopwatch,
  FaUser,
  FaHourglassEnd,
  FaBowlingBall,
  FaEllipsisH,
  FaCircle,
  FaExclamationCircle,
} from "react-icons/fa"
import { SESSION_RULE_HI, ODDS_RULE_HI, SITE_RULES_HI } from "./termsData"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  bookmaker: <FaBook />,
  casino: <FaDice />,
  fancy: <FaListOl />,
  "bowler-run-fancy": <FaBaseballBall />,
  test: <FaCalendarAlt />,
  odi: <FaCalendarDay />,
  t20: <FaBolt />,
  "extra-fancy": <FaPlusCircle />,
  concussion: <FaUserInjured />,
  "total-match-test": <FaFlagCheckered />,
  "limited-over-test": <FaHourglassHalf />,
  "bowler-wicket-test": <FaBullseye />,
  "bowler-over-test": <FaStopwatch />,
  "player-ball-test": <FaUser />,
  "limited-over-odi": <FaHourglassEnd />,
  "bowler-odi": <FaBowlingBall />,
  "other-t20": <FaEllipsisH />,
  "dot-ball": <FaCircle />,
  "power-surge": <FaBolt />,
  "result-errors": <FaExclamationCircle />,
}

// Cycled per category card so ~20 categories stay visually distinguishable
// without needing a hand-picked colour for each one.
const CATEGORY_ACCENTS = ["#4087fb", "#f0a500", "#00c2a8", "#a855f7", "#ef4444", "#10b981", "#ec4899", "#eab308"]

const TermsConditions = () => {
  return (
      <div className="terms-page">
        <div className="terms-header">
          <h1>Terms & Conditions</h1>
          <p className="terms-header-sub">कृपया इन्हें ध्यान से पढ़ें</p>
        </div>

        <div className="terms-continue-btn">
          <Link to="/main">Continue</Link>
        </div>

        <div className="terms-content">
          {/* General Rules */}
          <section className="terms-section terms-section--rules">
            <div className="terms-section-head">
              <span className="terms-section-icon"><FaExclamationTriangle /></span>
              <div>
                <h2>General Rules</h2>
                <p className="terms-section-desc">कृपया नियमों को समझने के लिए यहाँ कुछ मिनट दें, और अपने अनुसार समझ लें।</p>
              </div>
            </div>

            <div className="terms-rules">
              <div className="rule-item">
                <span className="rule-number">1</span>
                <span className="rule-text">सभी डीलर्स से निवेदन है कि क्लाइंट्स को साइट के रूल्स समझाने के बाद ही सौदे करवायें।</span>
              </div>

              <div className="rule-item">
                <span className="rule-number">2</span>
                <span className="rule-text">अगर आप इस एग्रीमेंट को ऐक्सेप्ट नहीं करते है तो कोई सौदा नहीं कीजिये।</span>
              </div>

              <div className="rule-item">
                <span className="rule-number">3</span>
                <span className="rule-text">सर्वर या वेबसाइट में किसी तरह की खराबी आने या बंद हो जाने पर केवल किए गए सौदे ही मान्य होंगे। ऐसी स्थिति में किसी तरह का वाद-विवाद मान्य नहीं होगा</span>
              </div>

              <div className="rule-item">
                <span className="rule-number">4</span>
                <span className="rule-text">कंपनी के पास अधिकार है कि वे किसी भी ऐड/शर्तों को निलंबित/रद्द करें अगर यह गलतफहमी साबित होता है। उदाहरण स्वरूप, वीपीएन/रोबोट-प्रयोग/एक ही आईपी से एकाधिक प्रवेश की स्थिति में और अन्य। ध्यान दें: केवल जीतने वाली शर्तें ही रद्द की जाएँगी।</span>
              </div>

              <div className="rule-item">
                <span className="rule-number">5</span>
                <span className="rule-text">कंपनी के पास अधिकार है कि वे किसी भी मैच की कोई भी सौदे (केवल जीतने वाली सौदे) किसी भी समय मैच के किसी भी बिंदु पर रद्द करें अगर कंपनी का विश्वास होता है कि उस विशेष मैच में कोई धोखाधड़ी/गलत कृत्य हो रहा है खिलाड़ियों द्वारा (चाहे वो बैट्समैन/गेंदबाज हों)।</span>
              </div>
            </div>
          </section>

          {/* Session Time Limit rule (13.2.2) — translated to Hindi */}
          <section className="terms-section terms-section--session">
            <div className="terms-section-head">
              <span className="terms-section-icon"><FaClock /></span>
              <div>
                <h2>{SESSION_RULE_HI.title}</h2>
              </div>
            </div>
            <div className="terms-section-body">
              {SESSION_RULE_HI.body.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {/* Odds rule (8.10) — translated to Hindi */}
          <section className="terms-section terms-section--odds">
            <div className="terms-section-head">
              <span className="terms-section-icon"><FaChartLine /></span>
              <div>
                <h2>{ODDS_RULE_HI.title}</h2>
              </div>
            </div>
            <div className="terms-section-body">
              {ODDS_RULE_HI.body.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {/* Game-play rules, category-wise */}
          {SITE_RULES_HI.map((cat, i) => (
            <section
              className="terms-section"
              key={cat.key}
              style={{ "--accent": CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length] } as React.CSSProperties}
            >
              <div className="terms-section-head">
                <span className="terms-section-icon">{CATEGORY_ICONS[cat.key]}</span>
                <div>
                  <h2>{cat.title}</h2>
                </div>
              </div>
              <div className="terms-section-body">
                {cat.paragraphs.map((para, j) =>
                  para.startsWith("## ") ? (
                    <h4 className="terms-section-subhead" key={j}>{para.slice(3)}</h4>
                  ) : (
                    <p key={j}>{para}</p>
                  )
                )}
              </div>
            </section>
          ))}

          <div className="terms-bottom-continue">
            <Link to="/main">Continue</Link>
          </div>
        </div>
      </div>
  )
}

export default TermsConditions
