import React from 'react';
import './Nexts.css'; // Optional: Create a specific CSS file for this component

function Nexts({ data }) {
  return (
    <div className="section-container">
      <ul>
        {Object.entries(data).map(([nonTerminal, nextSet]) => (
          <li key={nonTerminal}>
            <strong>{nonTerminal}:</strong> {nextSet.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Nexts;
