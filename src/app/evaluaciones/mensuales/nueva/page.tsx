'use client'

import { useState, useEffect, FormEvent, FC, ReactNode, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from "@/components/MainLayout"
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft, ArrowRight, ArrowLeft, Info, AlertCircle, User, Calendar, ClipboardList, Star, Trophy, BrainCircuit, Target, Activity } from 'lucide-react'

// --- INTERFACES ---
interface Employee { id: number; fullName: string; employeeNo: string; }
// ✅ Interfaz sincronizada con los nombres del API y la Base de Datos
interface FormData {
    employeeId: string; evaluationDate: string; quarter: string; year: string;
    salesGoalObjective: string; salesGoalAchieved: string;
    activityObjective: string; activityAchieved: string;
    opportunityCreationObjective: string; opportunityCreationAchieved: string;
    opportunityConversionObjective: string; opportunityConversionAchieved: string;
    crmFollowUpObjective: string; crmFollowUpAchieved: string;
    extraPoints: string;
}
interface CriterioInfo { name: string; description: string; isPercentage: boolean; isCurrency: boolean; unit: string; ponderacion: number; tips: string[]; }

// --- CONFIGURACIÓN DE CRITERIOS ---
const CRITERIOS_CONFIG: Record<string, CriterioInfo> = {
    salesGoal: { name: 'Cumplimiento de Meta de Ventas', description: 'Porcentaje de cumplimiento frente a la cuota establecida', isPercentage: true, isCurrency: false, unit: '%', ponderacion: 30, tips: ['Ingresa el porcentaje objetivo (ej: 100 para 100%)', 'El resultado es el porcentaje real alcanzado', 'Valores mayores a 100% indican superación de meta'] },
    activity: { name: 'Actividad Comercial (Presencia)', description: 'Número de visitas y reuniones remotas documentadas', isPercentage: false, isCurrency: false, unit: 'visitas', ponderacion: 20, tips: ['Cuenta todas las visitas presenciales y remotas', 'Deben estar debidamente documentadas', 'Incluye reuniones formales con clientes'] },
    creation: { name: 'Creación de Oportunidades', description: 'Valor monetario de nuevas oportunidades creadas', isPercentage: false, isCurrency: true, unit: '$', ponderacion: 15, tips: ['Valor total en pesos de nuevas oportunidades', 'Solo cuentan oportunidades nuevas del período', 'Debe estar registrado en el CRM'] },
    conversion: { name: 'Conversión de Oportunidades (Hit Rate)', description: 'Tasa de conversión de oportunidades en ventas cerradas', isPercentage: true, isCurrency: false, unit: '%', ponderacion: 20, tips: ['Porcentaje de oportunidades convertidas en ventas', 'Fórmula: (Ventas Cerradas / Oportunidades) × 100', 'Mide la efectividad del cierre comercial'] },
    crm: { name: 'Seguimiento en CRM', description: 'Evaluación basada en la matriz de calidad de llenado del CRM', isPercentage: false, isCurrency: false, unit: 'puntos', ponderacion: 15, tips: ['Puntaje del 0 al 100 basado en calidad de datos', 'Evalúa completitud y actualización de registros', 'Incluye seguimiento oportuno de actividades'] }
};

// --- SUB-COMPONENTES (Tu diseño) ---
const FormStep: FC<{ title: string; subtitle: string; children: ReactNode; step: number; totalSteps: number; }> = ({ title, subtitle, children, step, totalSteps }) => ( <div className="bg-brand-background border border-brand-border rounded-xl shadow-sm p-8"> <div className="flex items-center gap-4 mb-6"> <div className="flex items-center justify-center w-10 h-10 bg-brand-green text-white rounded-full font-bold">{step}</div> <div className="flex-1"> <h2 className="text-xl font-bold text-brand-foreground">{title}</h2> <div className="flex items-center gap-2 mt-1"> <p className="text-gray-500">{subtitle}</p> <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Paso {step} de {totalSteps}</span> </div> </div> </div> <div className="space-y-6">{children}</div> </div> );
const StepNavigation: FC<{ currentStep: number; totalSteps: number; onNext: () => void; onBack: () => void; canProceed: boolean; }> = ({ currentStep, totalSteps, onNext, onBack, canProceed }) => ( <div className="flex justify-between items-center mt-8"> {currentStep > 1 ? ( <button type="button" onClick={onBack} className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"><ArrowLeft size={16}/> Anterior</button> ) : <div></div>} <div className="flex gap-2">{Array.from({ length: totalSteps }, (_, i) => ( <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i + 1 === currentStep ? 'bg-brand-green' : i + 1 < currentStep ? 'bg-green-300' : 'bg-gray-200'}`} /> ))}</div> {currentStep < totalSteps && ( <button type="button" onClick={onNext} disabled={!canProceed} className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${canProceed ? 'bg-brand-green hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Siguiente <ArrowRight size={16}/></button> )} </div> );
const InputGroup: FC<{ label: string; description: string; objectiveValue: string; achievedValue: string; onObjectiveChange: (e: ChangeEvent<HTMLInputElement>) => void; onAchievedChange: (e: ChangeEvent<HTMLInputElement>) => void; isPercentage?: boolean; isCurrency?: boolean; unit: string; ponderacion: number; tips: string[]; showTips: boolean; onToggleTips: () => void; }> = ({ label, description, objectiveValue, achievedValue, onObjectiveChange, onAchievedChange, isPercentage = false, isCurrency = false, unit, ponderacion, tips, showTips, onToggleTips }) => ( <div className="bg-white p-6 rounded-lg border border-gray-200"> <div className="flex items-start justify-between mb-4"> <div className="flex-1"> <h3 className="text-lg font-bold text-gray-800 mb-1">{label}</h3> <p className="text-sm text-gray-600 mb-2">{description}</p> <span className="inline-flex items-center px-2 py-1 bg-brand-green bg-opacity-10 text-brand-green text-xs font-medium rounded">Ponderación: {ponderacion} puntos</span> </div> <button type="button" className="text-gray-400 hover:text-brand-green transition-colors" onClick={onToggleTips}><Info size={18} /></button> </div> {showTips && ( <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4"> <div className="flex items-start"> <AlertCircle className="text-blue-400 mt-0.5 mr-2" size={16} /> <div> <h4 className="text-sm font-medium text-blue-800 mb-2">Consejos para este criterio:</h4> <ul className="text-sm text-blue-700 space-y-1">{tips.map((tip, index) => ( <li key={index} className="flex items-start"><span className="text-blue-400 mr-1">•</span>{tip}</li> ))}</ul> </div> </div> </div> )} <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label className="block text-sm font-medium text-gray-700 mb-2">Valor Objetivo ({unit})</label> <div className="relative"> {isCurrency && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>} <input type="number" step="any" placeholder={`Ingresa el objetivo en ${unit}`} value={objectiveValue} onChange={onObjectiveChange} required className={`w-full bg-gray-50 p-3 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all ${isCurrency ? 'pl-8' : 'pl-4'}`} /> {isPercentage && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>} </div> </div> <div> <label className="block text-sm font-medium text-gray-700 mb-2">Resultado Obtenido ({unit})</label> <div className="relative"> {isCurrency && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>} <input type="number" step="any" placeholder={`Resultado real en ${unit}`} value={achievedValue} onChange={onAchievedChange} required className={`w-full bg-gray-50 p-3 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all ${isCurrency ? 'pl-8' : 'pl-4'}`} /> {isPercentage && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>} </div> </div> </div> {objectiveValue && achievedValue && ( <div className="mt-3 p-3 bg-gray-50 rounded"><div className="flex items-center justify-between text-sm"><span className="text-gray-600">Cumplimiento:</span><span className={`font-bold ${parseFloat(achievedValue) >= parseFloat(objectiveValue) ? 'text-green-600' : 'text-orange-600'}`}>{objectiveValue !== '0' && !isNaN(parseFloat(objectiveValue)) ? `${((parseFloat(achievedValue) / parseFloat(objectiveValue)) * 100).toFixed(1)}%` : 'N/A'}</span></div></div> )} </div> );

// --- COMPONENTE PRINCIPAL ---
export default function NuevaEvaluacionMensualPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTips, setShowTips] = useState<Record<string, boolean>>({});
    const [formData, setFormData] = useState<FormData>({
        employeeId: '', 
        evaluationDate: '', 
        quarter: '', 
        year: new Date().getFullYear().toString(),
        salesGoalObjective: '', 
        salesGoalAchieved: '',
        activityObjective: '', 
        activityAchieved: '',
        opportunityCreationObjective: '', 
        opportunityCreationAchieved: '',
        opportunityConversionObjective: '', 
        opportunityConversionAchieved: '',
        crmFollowUpObjective: '', 
        crmFollowUpAchieved: '',
        extraPoints: '',
    });

    useEffect(() => { 
        fetch('/api/empleados', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data) => setEmployees(data))
            .catch(() => toast.error('Error al cargar la lista de empleados'))
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
        const { name, value } = e.target; 
        setFormData(prev => ({ ...prev, [name]: value })); 
    };

    const validateStep = (currentStep: number): boolean => {
        switch (currentStep) {
            case 1:
                return !!(formData.employeeId && formData.evaluationDate && formData.quarter && formData.year);
            case 2:
                return !!(formData.salesGoalObjective && formData.salesGoalAchieved && 
                          formData.activityObjective && formData.activityAchieved);
            case 3:
                return !!(formData.opportunityCreationObjective && formData.opportunityCreationAchieved &&
                          formData.opportunityConversionObjective && formData.opportunityConversionAchieved &&
                          formData.crmFollowUpObjective && formData.crmFollowUpAchieved);
            case 4:
                return true; 
            default:
                return false;
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loadingToast = toast.loading('Procesando evaluación...');
        
        try {
            const res = await fetch('/api/evaluaciones-mensuales', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'No se pudo guardar la evaluación.');
            }
            
            toast.success('✅ Evaluación guardada exitosamente', { id: loadingToast });
            router.push('/evaluaciones/mensuales/panel');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ocurrió un error inesperado', { 
                id: loadingToast 
            });
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const toggleTips = (criterio: string) => {
        setShowTips(prev => ({ ...prev, [criterio]: !prev[criterio] }));
    };

    const totalSteps = 4;
    const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId));

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto p-4 sm:p-6">
                <div className="mb-8">
                    <Link 
                        href="/evaluaciones/mensuales/panel" 
                        className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 w-fit mb-4 transition-colors"
                    >
                        <ChevronLeft size={16} /> Volver al Panel de Evaluaciones
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight text-brand-foreground">
                        Nueva Evaluación Mensual Comercial
                    </h1>
                    <p className="text-lg text-gray-600 mt-2">
                        Completa todos los criterios de evaluación para generar la rúbrica de desempeño
                    </p>
                    {selectedEmployee && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">
                                <span className="font-medium">Evaluando a:</span> {selectedEmployee.fullName}
                                {selectedEmployee.employeeNo && ` (${selectedEmployee.employeeNo})`}
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <FormStep 
                            title="Información General" 
                            subtitle="Selecciona el empleado y define el período de evaluación"
                            step={step}
                            totalSteps={totalSteps}
                        >
                            <div>
                                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Empleado a Evaluar <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    id="employeeId" 
                                    name="employeeId" 
                                    value={formData.employeeId} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full bg-gray-50 p-3 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
                                >
                                    <option value="">Selecciona un empleado</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.fullName} {emp.employeeNo && `- ${emp.employeeNo}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="evaluationDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Evaluación <span className="text-red-500">*</span>
                                    </label>
                                    <input type="date" id="evaluationDate" name="evaluationDate" value={formData.evaluationDate} onChange={handleChange} required className="w-full bg-gray-50 p-3 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"/>
                                </div>
                                <div>
                                    <label htmlFor="quarter" className="block text-sm font-medium text-gray-700 mb-2">
                                        Trimestre <span className="text-red-500">*</span>
                                    </label>
                                    <select id="quarter" name="quarter" value={formData.quarter} onChange={handleChange} required className="w-full bg-gray-50 p-3 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all">
                                        <option value="">Selecciona</option>
                                        <option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                                        Año <span className="text-red-500">*</span>
                                    </label>
                                    <input type="number" id="year" name="year" min="2020" max="2030" value={formData.year} onChange={handleChange} required className="w-full bg-gray-50 p-3 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"/>
                                </div>
                            </div>
                        </FormStep>
                    )}

                    {step === 2 && (
                        <FormStep 
                            title="Criterios Comerciales Principales" 
                            subtitle="Evaluación de ventas y actividad comercial"
                            step={step}
                            totalSteps={totalSteps}
                        >
                            <InputGroup {...CRITERIOS_CONFIG.salesGoal} label={CRITERIOS_CONFIG.salesGoal.name} objectiveValue={formData.salesGoalObjective} achievedValue={formData.salesGoalAchieved} onObjectiveChange={(e) => setFormData(prev => ({...prev, salesGoalObjective: e.target.value}))} onAchievedChange={(e) => setFormData(prev => ({...prev, salesGoalAchieved: e.target.value}))} showTips={!!showTips.salesGoal} onToggleTips={() => toggleTips('salesGoal')} />
                            <InputGroup {...CRITERIOS_CONFIG.activity} label={CRITERIOS_CONFIG.activity.name} objectiveValue={formData.activityObjective} achievedValue={formData.activityAchieved} onObjectiveChange={(e) => setFormData(prev => ({...prev, activityObjective: e.target.value}))} onAchievedChange={(e) => setFormData(prev => ({...prev, activityAchieved: e.target.value}))} showTips={!!showTips.activity} onToggleTips={() => toggleTips('activity')} />
                        </FormStep>
                    )}

                    {step === 3 && (
                        <FormStep 
                            title="Criterios de Gestión de Oportunidades" 
                            subtitle="Evaluación de creación, conversión y seguimiento en CRM"
                            step={step}
                            totalSteps={totalSteps}
                        >
                            <InputGroup {...CRITERIOS_CONFIG.creation} label={CRITERIOS_CONFIG.creation.name} objectiveValue={formData.opportunityCreationObjective} achievedValue={formData.opportunityCreationAchieved} onObjectiveChange={(e) => setFormData(prev => ({...prev, opportunityCreationObjective: e.target.value}))} onAchievedChange={(e) => setFormData(prev => ({...prev, opportunityCreationAchieved: e.target.value}))} showTips={!!showTips.creation} onToggleTips={() => toggleTips('creation')} />
                            <InputGroup {...CRITERIOS_CONFIG.conversion} label={CRITERIOS_CONFIG.conversion.name} objectiveValue={formData.opportunityConversionObjective} achievedValue={formData.opportunityConversionAchieved} onObjectiveChange={(e) => setFormData(prev => ({...prev, opportunityConversionObjective: e.target.value}))} onAchievedChange={(e) => setFormData(prev => ({...prev, opportunityConversionAchieved: e.target.value}))} showTips={!!showTips.conversion} onToggleTips={() => toggleTips('conversion')} />
                            <InputGroup {...CRITERIOS_CONFIG.crm} label={CRITERIOS_CONFIG.crm.name} objectiveValue={formData.crmFollowUpObjective} achievedValue={formData.crmFollowUpAchieved} onObjectiveChange={(e) => setFormData(prev => ({...prev, crmFollowUpObjective: e.target.value}))} onAchievedChange={(e) => setFormData(prev => ({...prev, crmFollowUpAchieved: e.target.value}))} showTips={!!showTips.crm} onToggleTips={() => toggleTips('crm')} />
                        </FormStep>
                    )}

                    {step === 4 && (
                        <FormStep 
                            title="Finalización y Puntos Extra" 
                            subtitle="Último paso: agregar puntos adicionales y guardar la evaluación"
                            step={step}
                            totalSteps={totalSteps}
                        >
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Puntos Extra (Opcional)</h3>
                                <p className="text-sm text-gray-600 mb-4">Otorga puntos adicionales por evidencia de compromiso, valores corporativos, iniciativas especiales o desempeño excepcional.</p>
                                <div className="max-w-xs">
                                    <label htmlFor="extraPoints" className="block text-sm font-medium text-gray-700 mb-2">Puntos Extra</label>
                                    <input type="number" step="0.1" min="0" max="20" id="extraPoints" name="extraPoints" value={formData.extraPoints} onChange={handleChange} placeholder="0.0" className="w-full bg-gray-50 p-3 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"/>
                                    <p className="text-xs text-gray-500 mt-1">Máximo 20 puntos</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-gray-200">
                                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-3 py-4 px-6 rounded-lg font-bold text-white text-lg transition-all bg-brand-green hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                                    {isSubmitting ? ( <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Procesando...</> ) : ( <>✅ Finalizar y Guardar Evaluación</> )}
                                </button>
                            </div>
                        </FormStep>
                    )}
                    <StepNavigation currentStep={step} totalSteps={totalSteps} onNext={() => setStep(s => s + 1)} onBack={() => setStep(s => s - 1)} canProceed={validateStep(step)} />
                </form>
            </div>
        </MainLayout>
    );
}