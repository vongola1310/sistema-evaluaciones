import { useState } from 'react';

interface FiltroEvaluacionesProps {
  onFiltrar: (filtros: {
    trimestre: string;
    año: string;
    mes: string;
    fechaInicio: string;
    fechaFin: string;
  }) => void;
}

export default function FiltroEvaluaciones({ onFiltrar }: FiltroEvaluacionesProps) {
  const [trimestre, setTrimestre] = useState('');
  const [año, setAño] = useState('');
  const [mes, setMes] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleFiltrar = () => {
    onFiltrar({
      trimestre,
      año,
      mes,
      fechaInicio,
      fechaFin,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {/* Trimestre */}
      <select
        value={trimestre}
        onChange={(e) => setTrimestre(e.target.value)}
        className="p-2 rounded bg-gray-800 text-white"
      >
        <option value="">Todos los trimestres</option>
        <option value="Q1">Q1</option>
        <option value="Q2">Q2</option>
        <option value="Q3">Q3</option>
        <option value="Q4">Q4</option>
      </select>

      {/* Año */}
      <select
        value={año}
        onChange={(e) => setAño(e.target.value)}
        className="p-2 rounded bg-gray-800 text-white"
      >
        <option value="">Todos los años</option>
        {Array.from({ length: 10 }).map((_, i) => {
          const year = new Date().getFullYear() - i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>

      {/* Mes */}
      <select
        value={mes}
        onChange={(e) => setMes(e.target.value)}
        className="p-2 rounded bg-gray-800 text-white"
      >
        <option value="">Todos los meses</option>
        {[
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ].map((mesNombre, index) => (
          <option key={index} value={index + 1}>
            {mesNombre}
          </option>
        ))}
      </select>

      {/* Fecha inicio */}
      <input
        type="date"
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.target.value)}
        className="p-2 rounded bg-gray-800 text-white"
      />

      {/* Fecha fin */}
      <input
        type="date"
        value={fechaFin}
        onChange={(e) => setFechaFin(e.target.value)}
        className="p-2 rounded bg-gray-800 text-white"
      />

      <button
        onClick={handleFiltrar}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Filtrar
      </button>
    </div>
  );
}
