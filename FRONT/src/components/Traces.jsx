import React from 'react';
import './Trace.css'; // Optional: Add CSS for styling

function Trace({ data }) {
  if (!data || !Array.isArray(data)) {
    return <p>No trace data available</p>;
  }

  return (
    <div className="trace-section">
      {data.map((step, index) => (
        <div key={index} className="trace-step">
          <p><strong>Stack:</strong> {step.stack}</p>
          <p><strong>Input:</strong> {step.input}</p>
          <p><strong>Action:</strong> {step.action}</p>
        </div>
      ))}
    </div>
  );
}

export default Trace;
