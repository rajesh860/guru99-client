import { useEffect } from "react"
import { useParams } from "react-router-dom"
import "./ResultModal.scss"
import { useGetCasinoResultByRoundIdMutation } from "../../../store/service/casino/casinoServices"
import ResultModalContent3Card from "./teenPatti/ResultModalContent3Card"
import AndarBaharResult from "./andarBhar/AndarBaharResult"
import AAAResult from "./AAAResult"

interface ResultModalProps {
  mid: string
  tableId: string
  open: boolean
  setOpen: (open: boolean) => void
}

const ResultModal = ({ mid, tableId, open, setOpen }: ResultModalProps) => {
  const { id } = useParams<{ id: string }>()
  const [trigger, { data, isLoading }] = useGetCasinoResultByRoundIdMutation()

  // Fetch result when mid changes
  useEffect(() => {
    if (mid) trigger(mid)
  }, [mid, trigger])

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.classList.toggle("modal-open-sus", open)
  }, [open])

  // Close modal on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div
        className="modal-container"
        onClick={e => e.stopPropagation()} // Prevent closing on inner click
      >
        <div className="modal-header">
          <div className="game-name">{`Result`}</div>
          <button
            type="button"
            className="close-btn"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {isLoading && <p>Loading result...</p>}

          {(id === "51" || id === "57") && data?.data && (
            <ResultModalContent3Card result={data.data} />
          )}

          {/* Add other components here */}
          {id === "54" && data?.data && <AndarBaharResult result={data.data} />}
          {/* {id === "52" && data?.data && <DRAGONRules result={data.data} />} */}
          {["54", "55", "53"].includes(id || "") && data?.data && (
            <AAAResult id={id!} result={data.data} />
          )}
          {/* {id === "61" && data?.data && <DTLResult id={id!} result={data.data} />} */}
        </div>
      </div>
    </div>
  )
}

export default ResultModal
