// src/components/ReportView.tsx

import type { FC } from 'react'
import { CheckCircle, XCircle, MinusCircle, BarChart, CalendarDays, Star } from 'lucide-react'

// --- DEFINICIÓN DE TIPOS ---
interface ReportData {
    averageScore: number;
    rubrica: string;
    employee: { firstName: string; lastName: string; employeeNo: string; };
    evaluator: { name: string | null; };
    startDate: Date;
    endDate: Date;
    evaluations: {
        id: number;
        opportunity: { number: string; name: string; };
        scoreRaw: number;
        possibleScore: number;
        [key: string]: any;
    }[];
    totalScore: number;
    possibleScore: number;
}

// --- DATOS Y FUNCIONES DE AYUDA (necesarios para el componente) ---

const camposEvaluacion = [
    { key: 'updatedDate', label: 'Fecha de cierre realista y actualizada' },
    { key: 'correctPriceQty', label: 'Productos/servicios, precios y cantidades correctos' },
    { key: 'quoteUploaded', label: 'PDF de la cotización cargado' },
    { key: 'description', label: 'Descripción clara del problema y la solución' },
    { key: 'recentFollowUp', label: 'Actividad reciente registrada' },
    { key: 'correctStage', label: 'Etapa del pipeline correcta' },
    { key: 'realisticChance', label: 'Porcentaje de cierre realista' },
    { key: 'nextStepsDefined', label: 'Tareas o actividades futuras definidas' },
    { key: 'contactAssigned', label: 'Contacto principal registrado' },
    { key: 'commentsUpdated', label: 'Comentarios recientes de acuerdos' },
]

const getRubricaColor = (rubrica: string) => {
    switch (rubrica.toLowerCase()) {
      case 'excelente': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'bueno': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'necesita mejora': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'bajo desempeño': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
};

// --- SUB-COMPONENTES DE UI ---

const CircularProgressBar: FC<{ percentage: number, score: number }> = ({ percentage, score }) => {
    const sqSize = 120;
    const strokeWidth = 12;
    const radius = (sqSize - strokeWidth) / 2;
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - dashArray * percentage / 100;
    let colorClass = 'text-green-400';
    if (percentage < 75) colorClass = 'text-yellow-400';
    if (percentage < 60) colorClass = 'text-red-400';
    
    return (
      <div className="relative" style={{ width: sqSize, height: sqSize }}>
        <svg width={sqSize} height={sqSize} viewBox={viewBox} className="transform -rotate-90">
          <circle className="text-gray-700" cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} stroke="currentColor" fill="transparent" />
          <circle className={`${colorClass} transition-all duration-500`} cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} stroke="currentColor" fill="transparent" strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${colorClass}`}>{score.toFixed(1)}<span className='text-sm'>/20</span></span>
        </div>
      </div>
    );
};

const ScoreIcon: FC<{ score: string }> = ({ score }) => {
    if (score === '2') return <CheckCircle className="text-green-500" />;
    if (score === '1') return <MinusCircle className="text-yellow-500" />;
    if (score === '0') return <XCircle className="text-red-500" />;
    return <span className="text-gray-500 text-sm">N/A</span>;
};

// --- COMPONENTE PRINCIPAL (EXPORTADO) ---

const ReportView: FC<{ report: ReportData }> = ({ report }) => {
  return (
    <>
      {/* Sección de Resumen y KPIs */}
      <div className="bg-gray-800 border border-white/10 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-8 mb-8">
        <div className="flex-shrink-0">
          <CircularProgressBar percentage={(report.averageScore / 20) * 100} score={report.averageScore} />
        </div>
        <div className="flex-grow w-full">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400">Empleado Evaluado</p>
              <h2 className="text-2xl font-bold text-white">{report.employee.firstName} {report.employee.lastName}</h2>
              <p className="text-sm text-gray-400 font-mono">{report.employee.employeeNo}</p>
            </div>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getRubricaColor(report.rubrica)}`}>
              {report.rubrica}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6 border-t border-white/10 pt-4">
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 flex items-center gap-2"><CalendarDays size={14}/> Período</p>
              <p className="font-semibold">{report.startDate.toLocaleDateString('es-MX')} - {report.endDate.toLocaleDateString('es-MX')}</p>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 flex items-center gap-2"><BarChart size={14}/> Oportunidades Evaluadas</p>
              <p className="font-semibold">{report.evaluations.length}</p>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 flex items-center gap-2"><Star size={14}/> Puntaje Total</p>
              <p className="font-semibold">{report.totalScore} / {report.possibleScore}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Evaluaciones Individuales */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-white">Desglose de Evaluaciones</h3>
        <div className="space-y-4">
          {report.evaluations.map(ev => (
            <div key={ev.id} className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-white">{ev.opportunity.number} - {ev.opportunity.name}</h4>
                <p className="text-sm font-bold text-gray-300">Puntaje: <span className="text-green-400">{ev.scoreRaw} / {ev.possibleScore}</span></p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {camposEvaluacion.map(campo => {
                      const value = ev[campo.key];
                      const commentKey = `${campo.key}Comment`;
                      const comment = ev[commentKey];
                      return (
                        <tr key={campo.key} className="border-b border-gray-700/50 last:border-b-0">
                          <td className="py-2 pr-4 text-gray-300">{campo.label}</td>
                          <td className="py-2 pr-4 w-24"><ScoreIcon score={value as string} /></td>
                          <td className="py-2 text-gray-400 italic text-xs">{comment || '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReportView;