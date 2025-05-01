import React from 'react';

const FontSizeIndicator = ({ fieldType, size }) => {
  // Determinar el nombre legible del campo
  const getFieldName = () => {
    switch (fieldType) {
      case 'name':
        return 'Nombre';
      case 'title':
        return 'Título';
      case 'id':
        return 'ID';
      case 'company':
        return 'Empresa';
      default:
        return 'Texto';
    }
  };

  return (
    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-70 hover:opacity-100 transition-opacity z-30 pointer-events-none">
      {getFieldName()}: {size}px
    </div>
  );
};

export default FontSizeIndicator;
