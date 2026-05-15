import React, { useEffect, useMemo, useState } from "react"
import moment from "moment"
import BackBtn from "../../Component/BackBtn/BackBtn"
import CommonLodding from "../../Component/CommonLodding"
import { useGetAccountStatementQuery } from "../../../store/service/userServices/userServices"
import "./Statement.scss"

const Statement = () => {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const { data, isLoading } = useGetAccountStatementQuery(
    { page, limit },
    { pollingInterval: 5000 }
  )

  const rows = useMemo(() => {
    const transactions = (data as any)?.data?.transactions
    return Array.isArray(transactions) ? transactions : []
  }, [data])

  const summary = useMemo(() => {
    return (data as any)?.data?.summary || {
      openingBalance: 0,
      totalCredit: 0,
      totalDebit: 0,
      closingBalance: 0
    }
  }, [data])

  const pagination = useMemo(() => {
    return (data as any)?.data?.pagination || {
      total: 0,
      limit: 10,
      skip: 0,
      page: 1,
      totalPages: 1
    }
  }, [data])

  const computedRows = useMemo(() => {
    const toNum = (v: any): number | null => {
      if (v === "" || v == null) return null
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }

    const formatMoney = (v: number) => {
      if (!Number.isFinite(v)) return ""
      return Number.isInteger(v) ? String(v) : v.toFixed(2)
    }

    return rows.map((r: any) => {
      const transaction = toNum(r?.transaction) ?? 0
      const closingBalance = toNum(r?.closingBalance) ?? 0
      const isCredit = r?.credit === "Credit"
      
      return {
        raw: r,
        prevBal: closingBalance - transaction,
        credit: isCredit ? transaction : 0,
        debit: isCredit ? 0 : transaction,
        balance: closingBalance,
        prevBalText: formatMoney(closingBalance - transaction),
        creditText: isCredit ? formatMoney(transaction) : "",
        debitText: isCredit ? "" : formatMoney(transaction),
        balanceText: formatMoney(closingBalance),
      }
    })
  }, [rows])

  return (
    <>
      {isLoading && <CommonLodding />}
      <BackBtn to="/main" name="BACK TO MAIN MENU" />

      <div className="statement-ss2">
        <div className="statement-ss2__container">
          <div className="statement-ss2__card">
            <div className="statement-ss2__title">MY STATEMENT</div>

            <div className="statement-ss2__tableWrap">
              <table className="statement-ss2__table">
                <thead>
                  <tr>
                    <th style={{ width: "22%" }}>DATE</th>
                    <th style={{ width: "38%" }}>DESCRIPTION</th>
                    <th style={{ width: "10%" }}>PrevBal</th>
                    <th style={{ width: "10%" }}>CREDIT</th>
                    <th style={{ width: "10%" }}>DEBIT</th>
                    <th style={{ width: "10%" }}>BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {computedRows.length === 0 ? (
                    <tr>
                      <td className="statement-ss2__empty" colSpan={6}>
                        No data
                      </td>
                    </tr>
                  ) : (
                    computedRows.map((x: any, idx: number) => {
                      const r = x.raw
                      const dateText = r?.placeDate || r?.date || r?.createdAt || ""
                      const desc = r?.details || r?.description || r?.remark || "-"

                      return (
                        <tr key={r?.transactionId || idx}>
                          <td className="statement-ss2__date">
                            {dateText ? moment(dateText).format("MMM DD, YYYY h:mm:ss A") : ""}
                          </td>
                          <td className="statement-ss2__desc">{desc}</td>
                          <td className="statement-ss2__num">{x.prevBalText}</td>
                          <td className="statement-ss2__num statement-ss2__credit">{x.creditText}</td>
                          <td className="statement-ss2__num statement-ss2__debit">{x.debitText}</td>
                          <td className="statement-ss2__num statement-ss2__balance">{x.balanceText}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="statement-ss2__pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="statement-ss2__pagination-btn"
              >
                Previous
              </button>
              <span className="statement-ss2__pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page === pagination.totalPages}
                className="statement-ss2__pagination-btn"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <BackBtn to="/main" name="BACK TO MAIN MENU" />
    </>
  )
}

export default Statement
