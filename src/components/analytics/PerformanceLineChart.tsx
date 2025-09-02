// /src/components/analytics/PerformanceLineChart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FC } from 'react';

interface ChartProps {
    data: {
        date: string;
        Puntaje: number;
    }[];
}

const PerformanceLineChart: FC<ChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis domain={[0, 20]} stroke="#6B7280" fontSize={12} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        color: '#FFFFFF'
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="Puntaje" stroke="#74C054" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PerformanceLineChart;