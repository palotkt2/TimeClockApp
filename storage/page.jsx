import React, { useState } from 'react';
import Header from '../components/Header';

const Page = () => {
  const [checkRecords, setCheckRecords] = useState([]);

  const handleRegisterCheck = (checkData) => {
    setCheckRecords((prevRecords) => [...prevRecords, checkData]);
    console.log('Registro de checada:', checkData); // Debugging
  };

  return (
    <div>
      <Header onRegisterCheck={handleRegisterCheck} />
      <div style={{ padding: '16px' }}>
        <h2>Registros de Checadas</h2>
        <ul>
          {checkRecords.map((record, index) => (
            <li key={index}>
              {record.formattedDate} - {record.time}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Page;
