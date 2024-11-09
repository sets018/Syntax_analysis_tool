import React from 'react';
import './AnalysisTable.css'; // Optional: Create a specific CSS file for this component

function AnalysisTable({ data }) {
  return (
    <div className="table-container">
      <h3>Analysis Table (Tabla M):</h3>
      <table>
        <thead>
          <tr>
            <th>Non-Terminal</th>
            {Object.keys(data[Object.keys(data)[0]]).map((symbol, index) => (
              <th key={index}>{symbol}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([nonTerminal, row], rowIndex) => (
            <tr key={rowIndex}>
              <td>{nonTerminal}</td>
              {Object.keys(data[Object.keys(data)[0]]).map((symbol, colIndex) => (
                <td key={colIndex}>
                  {row[symbol] && Object.keys(row[symbol]).length === 0 ? '-' : row[symbol]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AnalysisTable;
