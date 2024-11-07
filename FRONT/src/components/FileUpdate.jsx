import React, { useState } from 'react';

function FileUpload({ onFileContent }) {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        
        console.log('Raw file content:', content); // Log raw content for debugging
        onFileContent(content.split('\n')); // Pass the content as an array of lines
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload" className="upload-button">
        Subir archivo
      </label>
      {fileName && <p>Archivo cargado: {fileName}</p>}
    </div>
  );
}

export default FileUpload;
