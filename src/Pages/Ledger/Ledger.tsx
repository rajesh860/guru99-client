import React, { useEffect, useState } from "react"
import BackBtn from "../../Component/BackBtn/BackBtn"
import { Link, useNavigate } from "react-router-dom"
import {
  useGetLedgerDetailsMutation,
} from "../../../store/service/userServices/userServices"
import moment from "moment"
import CommonLodding from "../../Component/CommonLodding"
import "./Ledger.scss"

const Ledger = () => {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const navigate = useNavigate()

  const [trigger, { data: ledgerData, isLoading }] =
    useGetLedgerDetailsMutation()

  useEffect(() => {
    trigger({ page, limit })
  }, [page, limit, trigger])

  const ledgerList = ledgerData?.data?.ledger || []
  const summary = ledgerData?.data?.summary || {
    totalWon: 0,
    totalLost: 0,
    totalHisab: 0
  }
  const pagination = ledgerData?.data?.pagination || {
    total: 0,
    limit: 10,
    page: 1,
    totalPages: 1
  }

  return (
    <>
      {isLoading && <CommonLodding />}
      <BackBtn to="/main" name="BACK TO MAIN MENU" />
      <div className="ledger-ss2">
        <div className="ledger-ss2__container">
          <div className="ledger-ss2__card">
            <div className="ledger-ss2__title">MY LEDGER</div>

            <div className="ledger-ss2__tableWrap">
              <table className="ledger-ss2__table">
                <thead>
                  <tr>
                    {/* <th style={{ width: "10%" }}>S.NO</th> */}
                    <th style={{ width: "26%" }}>DESCRIPTION</th>
                    <th style={{ width: "18%" }}>WON BY</th>
                    <th style={{ width: "12%" }}>WON</th>
                    <th style={{ width: "12%" }}>LOST</th>
                    {/* <th style={{ width: "12%" }}>TYPE</th> */}
                    <th style={{ width: "18%" }}>HISAB</th>
                  </tr>
                </thead>

                <tbody>
                  {ledgerList.map((data, index) => (
                    <tr key={index}>
                      {/* <td style={{ textAlign: "center" }}>
                        {data?.sNo}
                      </td> */}

                      <td>
                        {data?.type === "match" ? (
                          <Link
                            to={`/cricketResult/${data?.beventId}`}
                            className="ledger-ss2__matchLink"
                          >
                            <span className="ledger-ss2__matchName">
                              {data?.matchName || data?.description}
                            </span>
                            <span className="ledger-ss2__matchDate">
                              {moment(data?.settledAt).format(
                                "DD/MM/YYYY HH:mm",
                              )}
                            </span>
                          </Link>
                        ) : data?.marketType === "casino" ? (
                          <div 
                            className="ledger-ss2__matchLink ledger-ss2__matchLink--clickable"
                            onClick={() => navigate(`/casino-ledger/${data?.gameCode || ""}/${moment(data?.settledAt).format("YYYY-MM-DD")}`)}
                          >
                            <span className="ledger-ss2__matchName">
                              {data?.matchName || data?.description}
                            </span>
                            <span className="ledger-ss2__matchDate">
                              {moment(data?.settledAt).format(
                                "DD/MM/YYYY HH:mm",
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="ledger-ss2__matchLink">
                            <span className="ledger-ss2__matchName">
                              {data?.matchName || data?.description}
                            </span>
                            <span className="ledger-ss2__matchDate">
                              {moment(data?.settledAt).format(
                                "DD/MM/YYYY HH:mm",
                              )}
                            </span>
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <span className="ledger-ss2__wonBy">
                          {data?.wonBy || "-"}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <span className="ledger-ss2__num ledger-ss2__num--won">
                          {Number(data?.won).toFixed(2)}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <span className="ledger-ss2__num ledger-ss2__num--lost">
                          {Number(data?.lost).toFixed(2)}
                        </span>
                      </td>

                      {/* <td style={{ textAlign: "center" }}>
                        <span className="ledger-ss2__pill">
                          {Number(data?.won) > 0 ? 'won' : data?.type}
                        </span>
                      </td> */}

                      <td style={{ textAlign: "right" }}>
                        <span
                          className={
                            Number(data?.hisab || 0) >= 0
                              ? "ledger-ss2__num ledger-ss2__num--pos"
                              : "ledger-ss2__num ledger-ss2__num--neg"
                          }
                        >
                          {Number(data?.hisab).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="ledger-ss2__pagination-controls">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="ledger-ss2__pagination-btn"
                >
                  Previous
                </button>
                <span className="ledger-ss2__pagination-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  className="ledger-ss2__pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <BackBtn to="/main" name="BACK TO MAIN MENU" />
    </>
  )
}

export default Ledger
