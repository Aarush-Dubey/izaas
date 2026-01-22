import React from 'react';
import { BarChart as RechartBar, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BarChart = ({ data, props }) => {
    const { title } = props;

    return (
        <div className="w-full h-64 p-4 bg-white/5 rounded-xl border border-white/10 mt-4 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RechartBar data={data.labels.map((label, i) => ({ name: label, value: data.values[i] }))}>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.labels.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'rgb(0, 240, 181)' : 'rgb(255, 184, 0)'} />
                        ))}
                    </Bar>
                </RechartBar>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChart;
