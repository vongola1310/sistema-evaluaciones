// /src/components/analytics/HitRatePieChart.tsx
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { FC } from 'react';

interface ChartProps {
    data: {
        name: string;
        value: number;
    }[];
}

const COLORS = ['#74C054', '#EF4444']; // Verde para 'Ganadas', Rojo para 'Perdidas'

const HitRatePieChart: FC<ChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                     contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        color: '#FFFFFF'
                    }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default HitRatePieChart;