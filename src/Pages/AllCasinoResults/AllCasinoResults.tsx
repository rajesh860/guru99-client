import React from "react";
import "./styles.scss";

const data = [
  { id: "116260204000033", winner: "Tiger" },
  { id: "116260204000114", winner: "Tiger" },
  { id: "116260204000157", winner: "Tiger" },
  { id: "116260204000238", winner: "Dragon" },
  { id: "116260204000318", winner: "Dragon" },
  { id: "116260204000400", winner: "Dragon" },
  { id: "116260204000442", winner: "Tiger" },
];

const AllCasinoResults = () => {
  return (
    <div className="result-page">
      {/* Filters */}
      <div className="filters">
        <input type="date" defaultValue="2026-02-04" />

        <select>
          <option>Dragon Tiger</option>
        </select>

        <input type="text" placeholder="" />

        <button className="search-btn">Search</button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Round ID</th>
              <th>Winner</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>
                  <span className="round-badge">{item.id}</span>
                </td>
                <td className="winner">{item.winner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default AllCasinoResults;
