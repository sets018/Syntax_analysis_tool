import React from 'react';
import './FactorizedGrammar.css'; // Optional: Create a specific CSS file for this component

function FactorizedGrammar({ data }) {
  return (
    <div className="section-container">
      <ul>
        {Object.entries(data).map(([nonTerminal, productions]) => (
          <li key={nonTerminal}>
            <strong>{nonTerminal}{'->'}</strong> {productions.join(' | ')}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FactorizedGrammar;
