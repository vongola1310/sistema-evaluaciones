'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import type { FC } from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Calendar, BarChart3 } from 'lucide-react';

interface ChartProps {
    data: {
        date: string;
        Puntaje: number;
    }[];
    maxValue?: number;
    showTrend?: boolean;
    showAverage?: boolean;
    showGoal?: boolean;
    goalValue?: number;
    height?: number;
    colors?: {
        primary: string;
        secondary: string;
        grid: string;
        text: string;
        area: string;
    };
}

const defaultColors = {
    primary: '#10B981',
    secondary: '#3B82F6', 
    grid: '#F3F4F6',
    text: '#6B7280',
    area: '#10B981'
};

const PerformanceLineChart: FC<ChartProps> = ({ 
    data,
    maxValue = 20,
    showTrend = true,
    showAverage = true,
    showGoal = true,
    goalValue = 15,
    height = 350,
    colors = defaultColors
}) => {
    // Análisis de datos
    const scores = data.map(item => item.Puntaje);
    const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    const latestScore = scores[scores.length - 1] || 0;
    const previousScore = scores[scores.length - 2];
    
    const calculateTrend = () => {
        if (data.length < 2) return { direction: 'stable', percentage: 0, icon: Minus };
        const recent = scores.slice(-3);
        const older = scores.slice(-6, -3);
        if (recent.length === 0 || older.length === 0) return { direction: 'stable', percentage: 0, icon: Minus };
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        const change = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
        if (change > 2) return { direction: 'up', percentage: change, icon: TrendingUp };
        if (change < -2) return { direction: 'down', percentage: Math.abs(change), icon: TrendingDown };
        return { direction: 'stable', percentage: Math.abs(change), icon: Minus };
    };
    
    const trend = calculateTrend();
    const lastChange = previousScore ? ((latestScore - previousScore) / previousScore) * 100 : 0;
    
    const enrichedData = data.map((item, index) => {
        const start = Math.max(0, index - 2);
        const movingAvgData = data.slice(start, index + 1);
        const movingAvg = movingAvgData.reduce((sum, d) => sum + d.Puntaje, 0) / movingAvgData.length;
        return { ...item, PromedioMovil: movingAvg, Meta: goalValue };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const mainData = payload.find((p: any) => p.dataKey === 'Puntaje');
            const movingAvgData = payload.find((p: any) => p.dataKey === 'PromedioMovil');
            
            if (!mainData) return null;
            
            const value = mainData.value;
            const percentage = ((value / maxValue) * 100).toFixed(1);
            const vsAverage = value - average;
            
            return (
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 min-w-[220px]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">{label}</span>
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">{percentage}%</div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Puntaje</span>
                                <span className="text-2xl font-bold text-gray-900">{value.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: colors.primary }} />
                            </div>
                        </div>
                        {movingAvgData && (<div className="text-xs text-gray-500">Promedio móvil: <span className="font-medium">{movingAvgData.value.toFixed(1)}</span></div>)}
                        <div className="flex items-center gap-4 text-xs">
                            <div className={`flex items-center gap-1 ${vsAverage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {vsAverage >= 0 ? '↗' : '↘'}
                                <span>{vsAverage >= 0 ? '+' : ''}{vsAverage.toFixed(1)} vs promedio</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full space-y-6">
            {showTrend && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Último Puntaje</p>
                                <p className="text-2xl font-bold text-blue-900">{latestScore.toFixed(1)}</p>
                                {previousScore && (
                                    <p className={`text-xs flex items-center gap-1 ${lastChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {lastChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {lastChange >= 0 ? '+' : ''}{lastChange.toFixed(1)}%
                                    </p>
                                )}
                            </div>
                            <BarChart3 className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-700">Promedio</p>
                                <p className="text-2xl font-bold text-emerald-900">{average.toFixed(1)}</p>
                                <p className="text-xs text-emerald-600">{((average / maxValue) * 100).toFixed(0)}% del máximo</p>
                            </div>
                            <Target className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-700">Tendencia</p>
                                <p className={`text-lg font-bold ${trend.direction === 'up' ? 'text-green-700' : trend.direction === 'down' ? 'text-red-700' : 'text-gray-700'}`}>
                                    {trend.direction === 'up' ? 'Subiendo' : trend.direction === 'down' ? 'Bajando' : 'Estable'}
                                </p>
                                <p className="text-xs text-purple-600">{trend.percentage.toFixed(1)}% cambio</p>
                            </div>
                            <trend.icon className={`w-8 h-8 ${trend.direction === 'up' ? 'text-green-500' : trend.direction === 'down' ? 'text-red-500' : 'text-gray-500'}`} />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Rango</p>
                                <p className="text-lg font-bold text-orange-900">{minScore.toFixed(1)} - {maxScore.toFixed(1)}</p>
                                <p className="text-xs text-orange-600">Variación: {(maxScore - minScore).toFixed(1)}</p>
                            </div>
                            <div className="text-orange-500"><div className="w-8 h-8 flex items-center justify-center">📊</div></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={enrichedData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                        <defs><linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors.area} stopOpacity={0.3}/><stop offset="95%" stopColor={colors.area} stopOpacity={0.05}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} strokeOpacity={0.6} />
                        <XAxis dataKey="date" stroke={colors.text} fontSize={12} tick={{ fill: colors.text }} />
                        <YAxis domain={[0, maxValue]} stroke={colors.text} fontSize={12} tick={{ fill: colors.text }} tickCount={6} />
                        
                        {showGoal && (
                            <ReferenceLine y={goalValue} stroke="#F59E0B" strokeDasharray="8 4" strokeWidth={2} label={{ value: `Meta: ${goalValue}`, position: 'right', fill: '#F59E0B', fontSize: 12 }} />
                        )}
                        {showAverage && (
                            <ReferenceLine y={average} stroke="#6B7280" strokeDasharray="4 4" strokeOpacity={0.7} label={{ value: `Promedio: ${average.toFixed(1)}`, position: 'left', fill: '#6B7280', fontSize: 12 }} />
                        )}
                        
                        <Area type="monotone" dataKey="Puntaje" stroke="none" fill="url(#colorGradient)" />
                        <Line type="monotone" dataKey="PromedioMovil" stroke={colors.secondary} strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} strokeOpacity={0.7} />
                        <Line type="monotone" dataKey="Puntaje" stroke={colors.primary} strokeWidth={3} dot={{ fill: colors.primary, strokeWidth: 2, stroke: '#ffffff', r: 4 }} activeDot={{ r: 8, stroke: colors.primary, strokeWidth: 3, fill: '#ffffff' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="line" wrapperStyle={{ fontSize: '14px', color: colors.text, paddingTop: '20px' }} />
                    </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">💡 <strong>Guía:</strong> La línea sólida muestra los puntajes reales, la punteada azul es la tendencia, y las de referencia son tu promedio y meta.</p>
                </div>
            </div>
        </div>
    );
};

export default PerformanceLineChart;