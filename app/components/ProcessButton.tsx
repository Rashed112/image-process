// components/ProcessButton.tsx

import React from 'react';
import { useSubmit } from '@remix-run/react';

const ProcessButton: React.FC = () => {
  const submit = useSubmit();
  
  const handleClick = async () => {
    try {
      const response = await fetch('/api/processData', {
        method: 'POST', // Assuming processData action requires a POST request
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to process data');
      }
      const data = await response.json();
      console.log(data.message); // Log the processed data message
    } catch (error) {
      console.error('Error processing data:', error);
    }
  };

  return (
    <button onClick={handleClick}>Process Data</button>
  );
};

export default ProcessButton;
