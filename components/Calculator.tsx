import React, { useState } from 'react';
import { X, Delete } from 'lucide-react';

interface CalculatorProps {
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const handleNumber = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
    setExpression(prev => prev + num);
  };

  const handleOperator = (op: string) => {
    setDisplay('0');
    setExpression(prev => prev + ' ' + op + ' ');
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleEqual = () => {
    try {
      // Güvenli olmayan eval yerine basit bir Function kullanımı (sadece demo amaçlı)
      // Gerçek projelerde mathjs gibi kütüphaneler önerilir.
      // Basit 4 işlem için bu yeterlidir.
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + expression)();
      setDisplay(String(result));
      setExpression(String(result));
    } catch (e) {
      setDisplay('Hata');
      setExpression('');
    }
  };

  const btnClass = "h-12 rounded-lg font-semibold text-lg transition-colors active:scale-95 flex items-center justify-center";
  const numBtnClass = `${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`;
  const opBtnClass = `${btnClass} bg-blue-100 text-blue-600 hover:bg-blue-200`;
  const actionBtnClass = `${btnClass} bg-red-100 text-red-600 hover:bg-red-200`;

  return (
    <div className="absolute top-16 right-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
        <span className="text-white text-sm font-medium">Hesap Makinesi</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Display */}
      <div className="p-4 bg-gray-50 border-b border-gray-100 text-right">
        <div className="text-xs text-gray-500 h-4 overflow-hidden">{expression}</div>
        <div className="text-3xl font-bold text-gray-800 truncate">{display}</div>
      </div>

      {/* Keypad */}
      <div className="p-4 grid grid-cols-4 gap-2">
        <button onClick={handleClear} className={`${actionBtnClass} col-span-3`}>C</button>
        <button onClick={() => handleOperator('/')} className={opBtnClass}>÷</button>

        <button onClick={() => handleNumber('7')} className={numBtnClass}>7</button>
        <button onClick={() => handleNumber('8')} className={numBtnClass}>8</button>
        <button onClick={() => handleNumber('9')} className={numBtnClass}>9</button>
        <button onClick={() => handleOperator('*')} className={opBtnClass}>×</button>

        <button onClick={() => handleNumber('4')} className={numBtnClass}>4</button>
        <button onClick={() => handleNumber('5')} className={numBtnClass}>5</button>
        <button onClick={() => handleNumber('6')} className={numBtnClass}>6</button>
        <button onClick={() => handleOperator('-')} className={opBtnClass}>-</button>

        <button onClick={() => handleNumber('1')} className={numBtnClass}>1</button>
        <button onClick={() => handleNumber('2')} className={numBtnClass}>2</button>
        <button onClick={() => handleNumber('3')} className={numBtnClass}>3</button>
        <button onClick={() => handleOperator('+')} className={opBtnClass}>+</button>

        <button onClick={() => handleNumber('0')} className={`${numBtnClass} col-span-2`}>0</button>
        <button onClick={() => handleNumber('.')} className={numBtnClass}>.</button>
        <button onClick={handleEqual} className={`${btnClass} bg-blue-600 text-white hover:bg-blue-700`}>=</button>
      </div>
    </div>
  );
};