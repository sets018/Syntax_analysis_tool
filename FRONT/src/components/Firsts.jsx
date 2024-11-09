import React from 'react';
import './Firsts.css'; // Optional: Create a specific CSS file for this component

function Firsts({ data }) {
  return (
    <div className="section-container">
      <ul>
        {Object.entries(data).map(([nonTerminal, firstSet]) => (
          <li key={nonTerminal}>
            <strong>{nonTerminal}{'->'}</strong> {firstSet.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Firsts;
