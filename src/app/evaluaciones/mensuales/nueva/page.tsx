'use client'

import { useState, useEffect, FormEvent, FC, ReactNode, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from "@/components/MainLayout"
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft, User, Calendar, ClipboardList, Star, Trophy, BrainCircuit, ArrowRight, ArrowLeft } from 'lucide-react'

// --- INTERFACES ---
interface Employee { id: number; fullName: string; }
interface FormData {
    employeeId: string;
    evaluationDate: string;
    quarter: string;
    year: string;
    salesGoalObjective: string; salesGoalAchieved: string;
    activityObjective: string; activityAchieved: string;
    creationObjective: string; creationAchieved: string;
    conversionObjective: string; conversionAchieved: string;
    crmObjective: string; crmAchieved: string;
    extraPoints: string;
}

// --- SUB-COMPONENTES DE DISEÑO Y FORMULARIO ---
const FormStep: FC<{ title: string; subtitle: string; children: ReactNode }> = ({ title, subtitle, children }) => (
    <div className="bg-brand-background border border-brand-border rounded-xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-brand-foreground">{title}</h2>
        <p className="text-gray-500 mb-6">{subtitle}</p>
        <div className="space-y-6">{children}</div>
    </div>
);

const StepNavigation: FC<{ currentStep: number; totalSteps: number; onNext: () => void; onBack: () => void; isNextDisabled?: boolean }> = ({ currentStep, totalSteps, onNext, onBack, isNextDisabled = false }) => (
    <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
            <button type="button" onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg">
                <ArrowLeft size={16}/> Anterior
            </button>
        ) : <div></div>}
        {currentStep < totalSteps && (
            <button type="button" onClick={onNext} disabled={isNextDisabled} className="flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-green-700 text-white font-semibold rounded-lg disabled:bg-gray-400">
                Siguiente <ArrowRight size={16}/>
            </button>
        )}
    </div>
);

const InputGroup: FC<{ label: string; objectiveValue: string; achievedValue: string; onObjectiveChange: (e: ChangeEvent<HTMLInputElement>) => void; onAchievedChange: (e: ChangeEvent<HTMLInputElement>) => void; isPercentage?: boolean }> = 
({ label, objectiveValue, achievedValue, onObjectiveChange, onAchievedChange, isPercentage = false }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
        <div className="grid grid-cols-2 gap-4">
            <div className="relative">
                <input type="number" placeholder="Valor Objetivo" value={objectiveValue} onChange={onObjectiveChange} required className="w-full bg-gray-50 p-2 rounded-md border border-gray-300 pl-4"/>
                {isPercentage && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>}
            </div>
            <div className="relative">
                <input type="number" placeholder="Resultado Obtenido" value={achievedValue} onChange={onAchievedChange} required className="w-full bg-gray-50 p-2 rounded-md border border-gray-300 pl-4"/>
                {isPercentage && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>}
            </div>
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function NuevaEvaluacionMensualPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        employeeId: '', evaluationDate: '', quarter: '', year: new Date().getFullYear().toString(),
        salesGoalObjective: '', salesGoalAchieved: '',
        activityObjective: '', activityAchieved: '',
        creationObjective: '', creationAchieved: '',
        conversionObjective: '', conversionAchieved: '',
        crmObjective: '', crmAchieved: '',
        extraPoints: '',
    });

    useEffect(() => {
        fetch('/api/empleados', { cache: 'no-store' })
          .then((res) => res.json())
          .then((data) => setEmployees(data))
          .catch(() => toast.error('Error al cargar empleados'))
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loadingToast = toast.loading('Guardando evaluación mensual...');
        try {
            const res = await fetch('/api/evaluaciones-mensuales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'No se pudo guardar la evaluación.');
            
            toast.success('Evaluación mensual guardada correctamente.', { id: loadingToast });
            router.push('/dashboard'); // O a una nueva página de reportes mensuales
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ocurrió un error', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalSteps = 4;

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="mb-8">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 w-fit mb-2">
                        <ChevronLeft size={16} /> Regresar al Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight text-brand-foreground">Nueva Evaluación Mensual</h1>
                    <p className="text-lg text-gray-600 mt-2">Sigue los pasos para completar la Rúbrica de Desempeño Comercial.</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <FormStep title="Paso 1: Información General" subtitle="Selecciona el empleado y el período a evaluar.">
                            <div>
                                <label htmlFor="employeeId" className="block text-sm font-bold text-gray-700 mb-2">Empleado</label>
                                <select id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} required className="w-full bg-gray-50 p-2 rounded-md border border-gray-300">
                                    <option value="">Selecciona un empleado</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><label htmlFor="evaluationDate" className='block text-sm font-medium text-gray-700 mb-1'>Fecha</label><input type="date" id="evaluationDate" name="evaluationDate" value={formData.evaluationDate} onChange={handleChange} required className="w-full bg-gray-50 p-2 rounded-md border border-gray-300"/></div>
                                <div><label htmlFor="quarter" className='block text-sm font-medium text-gray-700 mb-1'>Trimestre</label><select id="quarter" name="quarter" value={formData.quarter} onChange={handleChange} required className="w-full bg-gray-50 p-2 rounded-md border border-gray-300"><option value="">Selecciona</option><option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option></select></div>
                                <div><label htmlFor="year" className='block text-sm font-medium text-gray-700 mb-1'>Año</label><input type="number" id="year" name="year" value={formData.year} onChange={handleChange} required className="w-full bg-gray-50 p-2 rounded-md border border-gray-300"/></div>
                            </div>
                        </FormStep>
                    )}

                    {step === 2 && (
                        <FormStep title="Paso 2: Criterios Comerciales" subtitle="Introduce los valores objetivo y los resultados obtenidos.">
                            <InputGroup label="1. Cumplimiento de Meta de Ventas" objectiveValue={formData.salesGoalObjective} achievedValue={formData.salesGoalAchieved} onObjectiveChange={(e) => setFormData(prev => ({...prev, salesGoalObjective: e.target.value}))} onAchievedChange={(e) => setFormData(prev => ({...prev, salesGoalAchieved: e.target.value}))} isPercentage={true} />
                            <InputGroup label="2. Actividad Comercial (Presencia)" objectiveValue={formData.activityObjective} achievedValue={formData.activityAchieved} onObjectiveChange={(e) => setFormData(prev => ({...prev, activityObjective: e.target.value}))} onAchievedChange={(e) => setFormData(prev => ({...prev, activityAchieved: e.target.value}))} />
                        </FormStep>
                    )}

                    {step === 3 && (
                        <FormStep title="Paso 3: Criterios de Gestión" subtitle="Continúa con los valores de la gestión de oportunidades.">
                            <InputGroup label="3. Creación de Oportunidades" objectiveValue={formData.creationObjective} achievedValue={formData.creationAchieved} onObjectiveChange={(e) => setFormData(prev => ({...prev, creationObjective: e.target.value}))} onAchievedChange={(e) => setFormData(prev => ({...prev, creationAchieved: e.target.value}))} />
                            <InputGroup label="4. Conversión de Oportunidades" objectiveValue={formData.conversionObjective} achievedValue={formData.conversionAchieved} onObjectiveChange={(e) => setFormData(prev => ({...prev, conversionObjective: e.target.value}))} onAchievedChange={(e) => setFormData(prev => ({...prev, conversionAchieved: e.target.value}))} isPercentage={true} />
                            <InputGroup label="5. Seguimiento en CRM" objectiveValue={formData.crmObjective} achievedValue={formData.crmAchieved} onObjectiveChange={(e) => setFormData(prev => ({...prev, crmObjective: e.target.value}))} onAchievedChange={(e) => setFormData(prev => ({...prev, crmAchieved: e.target.value}))} />
                        </FormStep>
                    )}

                    {step === 4 && (
                        <FormStep title="Paso 4: Finalizar" subtitle="Introduce los puntos extra y guarda la evaluación.">
                            <div>
                                <label htmlFor="extraPoints" className="block text-sm font-bold text-gray-700 mb-2">+ Puntos Extra (Opcional)</label>
                                <input type="number" id="extraPoints" name="extraPoints" value={formData.extraPoints} onChange={handleChange} className="w-full bg-gray-50 p-2 rounded-md border border-gray-300"/>
                            </div>
                            <div className="pt-6 border-t border-brand-border">
                                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-bold text-white transition-all bg-brand-green hover:bg-green-700">
                                    {isSubmitting ? 'Guardando...' : 'Finalizar y Guardar Evaluación'}
                                </button>
                            </div>
                        </FormStep>
                    )}
                    
                    <StepNavigation 
                        currentStep={step} 
                        totalSteps={totalSteps}
                        onNext={() => setStep(s => s + 1)}
                        onBack={() => setStep(s => s - 1)}
                    />
                </form>
            </div>
        </MainLayout>
    );
}