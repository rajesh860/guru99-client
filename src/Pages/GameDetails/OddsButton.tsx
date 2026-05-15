interface OddsButtonProps {
  value: number | string
  type: "back" | "lay"
  onClick: () => void
  disabled?: boolean
  size?: number | string
}

const OddsButton = ({ value, type, onClick, disabled = false, size }: OddsButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: type === "back" ? "rgb(64 135 251)" : "rgb(240 121 143)",
        border: "none",
        borderRadius: "4px",
        color: "white",
        fontSize: "14px",
        fontWeight: "bold",
        padding: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        flex: 1,
        height: "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2px"
      }}
    >
      <div>{value}</div>
      {size && <div style={{ fontSize: "11px", opacity: 0.9 }}>{size}</div>}
    </button>
  )
}

export default OddsButton
