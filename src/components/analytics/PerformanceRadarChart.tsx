// /src/components/analytics/PerformanceRadarChart.tsx
'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { FC } from 'react';

interface ChartProps {
    data: {
        subject: string;
        value: number;
    }[];
}

const PerformanceRadarChart: FC<ChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" stroke="#4B5563" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 30]} stroke="#9CA3AF" />
                <Radar name="Puntaje Ponderado" dataKey="value" stroke="#74C054" fill="#74C054" fillOpacity={0.6} />
                <Tooltip
                     contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        color: '#FFFFFF'
                    }}
                />
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default PerformanceRadarChart;