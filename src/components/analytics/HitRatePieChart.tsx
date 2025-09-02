'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { FC } from 'react';
import { TrendingUp, Target, Award, AlertCircle } from 'lucide-react';

interface ChartProps {
    data: {
        name: string;
        value: number;
    }[];
}

// Colores mejorados con más opciones
const COLORS = [
    '#10B981', // Verde esmeralda para 'Ganadas'
    '#EF4444', // Rojo para 'Perdidas'
    '#F59E0B', // Ámbar para 'En Proceso'
    '#8B5CF6', // Púrpura para otros
    '#06B6D4', // Cian
    '#EC4899'  // Rosa
];

const HitRatePieChart: FC<ChartProps> = ({ data }) => {
    // Cálculos para estadísticas
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const ganadas = data.find(item => 
        item.name.toLowerCase().includes('ganada') || 
        item.name.toLowerCase().includes('éxito') ||
        item.name.toLowerCase().includes('exitosa')
    )?.value || 0;
    
    const perdidas = data.find(item => 
        item.name.toLowerCase().includes('perdida') || 
        item.name.toLowerCase().includes('fallida') ||
        item.name.toLowerCase().includes('fracaso')
    )?.value || 0;
    
    const hitRate = total > 0 ? (ganadas / total) * 100 : 0;
    const maxCategory = data.reduce((max, item) => item.value > max.value ? item : max, data[0]);
    
    // Datos enriquecidos con porcentajes
    const enrichedData = data.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.value / total) * 100) : 0
    }));

    // Tooltip personalizado
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / total) * 100).toFixed(1);
            
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[180px]">
                    <div className="flex items-center gap-3 mb-3">
                        <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: data.payload.fill }}
                        />
                        <span className="font-semibold text-gray-900">{data.name}</span>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Cantidad:</span>
                            <span className="text-xl font-bold text-gray-900">{data.value}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Porcentaje:</span>
                            <span className="text-lg font-semibold text-gray-700">{percentage}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: data.payload.fill
                                }}
                            />
                        </div>
                        
                        <div className="text-xs text-gray-500 text-center pt-1">
                            {data.value} de {total} total
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Etiquetas personalizadas para el pie
    const renderCustomLabel = (entry: any) => {
        const percentage = ((entry.value / total) * 100).toFixed(0);
        return `${percentage}%`;
    };

    // Leyenda personalizada
    const CustomLegend = (props: any) => {
        const { payload } = props;
        
        return (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {payload.map((entry: any, index: number) => {
                    const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-gray-700">
                                {entry.value}
                            </span>
                            <span className="text-xs text-gray-500">
                                ({percentage}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full space-y-6">
            {/* Panel de estadísticas superiores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-700">Tasa de Éxito</p>
                            <p className="text-2xl font-bold text-emerald-900">{hitRate.toFixed(1)}%</p>
                            <p className="text-xs text-emerald-600">
                                {ganadas} de {total} oportunidades
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-500" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700">Total Oportunidades</p>
                            <p className="text-2xl font-bold text-blue-900">{total}</p>
                            <p className="text-xs text-blue-600">
                                {data.length} categorías
                            </p>
                        </div>
                        <Target className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-700">Categoría Principal</p>
                            <p className="text-lg font-bold text-purple-900 leading-tight">
                                {maxCategory?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-purple-600">
                                {maxCategory?.value || 0} oportunidades
                            </p>
                        </div>
                        <Award className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Contenedor del gráfico */}
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-sm">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos disponibles</h3>
                        <p className="text-sm text-gray-500">No hay oportunidades registradas para mostrar.</p>
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={enrichedData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={90}
                                    innerRadius={30} // Crear un donut chart
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={renderCustomLabel}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                >
                                    {enrichedData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]}
                                            className="hover:opacity-80 transition-opacity duration-200"
                                            style={{
                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                            }}
                                        />
                                    ))}
                                </Pie>
                                
                                <Tooltip content={<CustomTooltip />} />
                                <Legend content={<CustomLegend />} />
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Tabla de detalles */}
                        <div className="mt-6 overflow-hidden border border-gray-200 rounded-lg">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cantidad
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Porcentaje
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progreso
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {enrichedData.map((item, index) => {
                                        const percentage = ((item.value / total) * 100);
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div 
                                                            className="w-4 h-4 rounded-full mr-3"
                                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                        />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                    {item.value}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {percentage.toFixed(1)}%
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="h-2 rounded-full transition-all duration-500"
                                                            style={{ 
                                                                width: `${percentage}%`,
                                                                backgroundColor: COLORS[index % COLORS.length]
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Nota explicativa */}
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-700">
                                💡 <strong>Análisis:</strong> Tu tasa de éxito actual es del {hitRate.toFixed(1)}%. 
                                {hitRate >= 70 ? ' ¡Excelente rendimiento!' : 
                                 hitRate >= 50 ? ' Buen rendimiento, hay oportunidad de mejora.' : 
                                 ' Hay oportunidades significativas de mejora.'}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HitRatePieChart;