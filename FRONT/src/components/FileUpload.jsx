import React from 'react';

function FileUpload({ onFileContent }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        onFileContent(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container">
      <input
        type="file"
        id="file-upload"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <label htmlFor="file-upload" className="upload-button">
        Upload File
      </label>
    </div>
  );
}

export default FileUpload;
