'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { FC } from 'react';
import { TrendingUp, Award, Target } from 'lucide-react';

interface ChartProps {
    data: {
        subject: string;
        value: number;
    }[];
    maxValue?: number;
    colors?: {
        primary: string;
        secondary?: string;
        grid: string;
        text: string;
        textSecondary: string;
    };
    showLegend?: boolean;
    showStats?: boolean;
    height?: number;
}

const defaultColors = {
    primary: '#10B981',
    secondary: '#3B82F6',
    grid: '#E5E7EB',
    text: '#1F2937',
    textSecondary: '#6B7280'
};

const PerformanceRadarChart: FC<ChartProps> = ({ 
    data, 
    maxValue = 30,
    colors = defaultColors,
    showLegend = true,
    showStats = true,
    height = 350
}) => {
    // Calcular estadísticas
    const totalScore = data.reduce((sum, item) => sum + item.value, 0);
    const averageScore = totalScore / data.length;
    const maxScore = Math.max(...data.map(item => item.value));
    const minScore = Math.min(...data.map(item => item.value));
    
    // Encontrar la competencia más fuerte y más débil
    const strongestSkill = data.find(item => item.value === maxScore)?.subject || '';
    const weakestSkill = data.find(item => item.value === minScore)?.subject || '';

    // Formato personalizado para el tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const percentage = ((value / maxValue) * 100).toFixed(1);
            
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: colors.primary }}
                        />
                        <h4 className="font-semibold text-gray-900">{label}</h4>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">{value.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">de {maxValue} puntos</p>
                        <div className="flex items-center gap-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: colors.primary
                                    }}
                                />
                            </div>
                            <span className="text-xs text-gray-500 ml-2">{percentage}%</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Formato personalizado para las etiquetas del eje angular
    const renderAngleAxis = (props: any) => {
        const { payload, x, y, cx, cy } = props;
        
        // Calcular la posición para evitar que las etiquetas se corten
        const radius = 120;
        const angle = Math.atan2(y - cy, x - cx);
        const adjustedX = cx + Math.cos(angle) * radius;
        const adjustedY = cy + Math.sin(angle) * radius;
        
        return (
            <text 
                x={adjustedX} 
                y={adjustedY} 
                textAnchor={adjustedX > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="fill-gray-700 text-sm font-medium"
            >
                {payload.value}
            </text>
        );
    };

    return (
        <div className="w-full space-y-4">
            {/* Estadísticas superiores */}
            {showStats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-700">Promedio General</p>
                                <p className="text-2xl font-bold text-emerald-900">
                                    {averageScore.toFixed(1)}
                                </p>
                                <p className="text-xs text-emerald-600">
                                    {((averageScore / maxValue) * 100).toFixed(0)}% del máximo
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Fortaleza Principal</p>
                                <p className="text-lg font-bold text-blue-900 leading-tight">
                                    {strongestSkill}
                                </p>
                                <p className="text-xs text-blue-600">{maxScore.toFixed(1)} puntos</p>
                            </div>
                            <Award className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Área de Mejora</p>
                                <p className="text-lg font-bold text-orange-900 leading-tight">
                                    {weakestSkill}
                                </p>
                                <p className="text-xs text-orange-600">{minScore.toFixed(1)} puntos</p>
                            </div>
                            <Target className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Contenedor del gráfico con mejor diseño */}
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <ResponsiveContainer width="100%" height={height}>
                    <RadarChart 
                        cx="50%" 
                        cy="50%" 
                        outerRadius="75%" 
                        data={data}
                        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                    >
                        {/* Grid con estilo mejorado */}
                        <PolarGrid 
                            stroke={colors.grid} 
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            opacity={0.7}
                        />
                        
                        {/* Eje angular personalizado */}
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={renderAngleAxis}
                            className="text-sm"
                        />
                        
                        {/* Eje radial con mejor estilo */}
                        <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, maxValue]} 
                            stroke={colors.textSecondary}
                            fontSize={10}
                            tickCount={6}
                            tick={{ fill: colors.textSecondary, fontSize: 10 }}
                        />
                        
                        {/* Área principal del radar con gradiente */}
                        <Radar 
                            name="Puntaje Ponderado" 
                            dataKey="value" 
                            stroke={colors.primary}
                            fill={colors.primary}
                            fillOpacity={0.25}
                            strokeWidth={3}
                            dot={{ 
                                fill: colors.primary, 
                                strokeWidth: 2, 
                                stroke: '#ffffff',
                                r: 5 
                            }}
                            activeDot={{ 
                                r: 7, 
                                stroke: colors.primary,
                                strokeWidth: 3,
                                fill: '#ffffff'
                            }}
                        />
                        
                        {/* Línea de referencia (promedio) opcional */}
                        <Radar 
                            name="Promedio" 
                            dataKey={() => averageScore}
                            stroke="#94A3B8"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fill="transparent"
                            dot={false}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        
                        {showLegend && (
                            <Legend 
                                verticalAlign="bottom"
                                height={36}
                                iconType="line"
                                wrapperStyle={{
                                    fontSize: '14px',
                                    color: colors.text
                                }}
                            />
                        )}
                    </RadarChart>
                </ResponsiveContainer>
                
                {/* Nota explicativa */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                        💡 <strong>Tip:</strong> Las áreas más grandes representan fortalezas. 
                        La línea punteada muestra el promedio general ({averageScore.toFixed(1)} puntos).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PerformanceRadarChart;