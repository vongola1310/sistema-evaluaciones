'use client'

import { useState, useEffect, FC, ChangeEvent } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { toast } from 'react-hot-toast';
import { ChevronLeft, SlidersHorizontal, Award, RotateCcw, Trash2, FileText } from 'lucide-react';

// --- INTERFACES ---
interface Employee { id: number; fullName: string; }
interface MonthlyEvaluation {
  id: number;
  evaluationDate: string;
  quarter: number;
  year: number;
  totalScore: number | null;
  rubrica: string | null;
  employee: {
    firstName: string;
    lastName: string;
    employeeNo: string;
  };
}

// --- SUB-COMPONENTES ---
const getRubricaColor = (rubrica: string | null) => {
    if (!rubrica) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (rubrica.toLowerCase()) {
      case 'excelente': return 'bg-green-100 text-green-800 border-green-200';
      case 'aceptable': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'necesita mejorar': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bajo desempeño': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medidas correctivas': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const ReportCard: FC<{ 
    report: MonthlyEvaluation; 
    isSelected: boolean; 
    onSelectionChange: (id: number) => void;
}> = ({ report, isSelected, onSelectionChange }) => (
    <div className={`bg-brand-background border rounded-xl shadow-sm transition-all relative ${isSelected ? 'border-brand-green ring-2 ring-brand-green/50' : 'border-brand-border hover:border-brand-green'}`}>
        <div className="absolute top-3 right-3 z-10">
            <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => onSelectionChange(report.id)}
                className="h-5 w-5 rounded border-gray-300 text-brand-green focus:ring-brand-green cursor-pointer"
            />
        </div>
        <div className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500">{report.employee.employeeNo}</p>
                    <h3 className="text-xl font-bold text-brand-foreground">{report.employee.firstName} {report.employee.lastName}</h3>
                </div>
                 <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getRubricaColor(report.rubrica)}`}>
                    {report.rubrica || 'Sin Calificar'}
                </span>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-border text-center">
                <p className="text-gray-500 text-sm mb-2">Puntaje Total</p>
                <p className="text-5xl font-bold text-center text-brand-foreground">{(report.totalScore || 0).toFixed(2)}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-border text-center">
                <Link 
                  href={`/evaluaciones/mensuales/resumen/${report.id}`}
                  className="inline-flex items-center gap-2 text-sm text-brand-green font-semibold hover:text-green-700"
                >
                    <FileText size={16}/> Ver y Descargar PDF
                </Link>
            </div>
        </div>
    </div>
);

// --- PÁGINA PRINCIPAL ---
export default function PanelEvaluacionesMensuales() {
    const [reports, setReports] = useState<MonthlyEvaluation[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReports, setSelectedReports] = useState<number[]>([]);
    
    const [employeeFiltro, setEmployeeFiltro] = useState('');
    const [yearFiltro, setYearFiltro] = useState<number | ''>(new Date().getFullYear());
    const [quarterFiltro, setQuarterFiltro] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        fetch('/api/empleados').then(res => res.json()).then(setEmployees);
        const params = new URLSearchParams();
        if (employeeFiltro) params.append('employeeId', employeeFiltro);
        if (yearFiltro) params.append('year', String(yearFiltro));
        if (quarterFiltro) params.append('quarter', quarterFiltro);
        const res = await fetch(`/api/evaluaciones-mensuales?${params.toString()}`, { cache: 'no-store' });
        if (res.ok) { const data = await res.json(); setReports(data); }
        setIsLoading(false);
        setSelectedReports([]);
    };

    useEffect(() => { fetchData(); }, [employeeFiltro, yearFiltro, quarterFiltro]);
    
    const handleSelectionChange = (id: number) => { setSelectedReports(prev => prev.includes(id) ? prev.filter(reportId => reportId !== id) : [...prev, id]); };
    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.checked) { setSelectedReports(reports.map(r => r.id)); } else { setSelectedReports([]); } };
    const handleDeleteSelected = async () => { if (selectedReports.length === 0) { toast.error('No has seleccionado ninguna evaluación.'); return; } if (window.confirm(`¿Seguro que quieres eliminar ${selectedReports.length} evaluaciones?`)) { const toastId = toast.loading('Eliminando...'); try { const res = await fetch('/api/evaluaciones-mensuales', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedReports }) }); if (!res.ok) throw new Error('No se pudieron eliminar.'); toast.success('Evaluaciones eliminadas.', { id: toastId }); fetchData(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Ocurrió un error', { id: toastId }); } } };
    const handleClearFilters = () => { setEmployeeFiltro(''); setYearFiltro(new Date().getFullYear()); setQuarterFiltro(''); };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <div className="mb-8">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 w-fit mb-2"><ChevronLeft size={16} /> Regresar al Dashboard</Link>
                    <h1 className="text-4xl font-bold tracking-tight text-brand-foreground">Panel de Evaluaciones Mensuales</h1>
                    <p className="text-lg text-gray-600 mt-2">Consulta los resultados de las rúbricas de desempeño comercial.</p>
                </div>

                <div className="bg-brand-background border border-brand-border rounded-xl p-6 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-4"><div className='flex items-center gap-3'><SlidersHorizontal className="text-brand-green" size={20} /><h2 className="text-lg font-semibold">Filtros</h2></div><button onClick={handleClearFilters} className="flex items-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-md"><RotateCcw size={14}/>Limpiar</button></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select value={employeeFiltro} onChange={(e) => setEmployeeFiltro(e.target.value)} className="w-full bg-brand-background p-2 rounded-md border border-brand-border"><option value="">Todos los Empleados</option>{employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}</select>
                        <select value={quarterFiltro} onChange={(e) => setQuarterFiltro(e.target.value)} className="w-full bg-brand-background p-2 rounded-md border border-brand-border"><option value="">Todos los Trimestres</option><option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option></select>
                        <select value={yearFiltro} onChange={(e) => setYearFiltro(e.target.value ? Number(e.target.value) : '')} className="w-full bg-brand-background p-2 rounded-md border border-brand-border"><option value="">Todos los Años</option>{Array.from({ length: 5 }, (_, i) => <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>)}</select>
                    </div>
                    {reports.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-brand-border flex items-center gap-4">
                            <div className="flex items-center"><input id="select-all" type="checkbox" onChange={handleSelectAll} checked={reports.length > 0 && selectedReports.length === reports.length} className="h-5 w-5 rounded border-gray-300 text-brand-green focus:ring-brand-green"/><label htmlFor="select-all" className="ml-2 text-sm text-gray-600">Seleccionar todo</label></div>
                            {selectedReports.length > 0 && (<button onClick={handleDeleteSelected} className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md"><Trash2 size={14}/>Eliminar ({selectedReports.length})</button>)}
                        </div>
                    )}
                </div>

                {isLoading ? ( <div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div></div> ) : (
                    reports.length === 0 ? ( <div className="text-center py-16 bg-brand-card rounded-lg border"><Award className="mx-auto text-gray-400" size={48} /><h3 className="mt-4 text-lg font-semibold">No se encontraron evaluaciones</h3><p className="mt-1 text-sm text-gray-500">Prueba a cambiar los filtros.</p></div> ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reports.map(report => 
                                <ReportCard 
                                    key={report.id} 
                                    report={report} 
                                    isSelected={selectedReports.includes(report.id)}
                                    onSelectionChange={handleSelectionChange}
                                />
                            )}
                        </div>
                    )
                )}
            </div>
        </MainLayout>
    );
}