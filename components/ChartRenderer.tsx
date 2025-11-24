import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { ChartConfig } from '../types';

interface ChartRendererProps {
  config: ChartConfig;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ChartRenderer: React.FC<ChartRendererProps> = ({ config }) => {
  const { type, data, xAxisKey, seriesKeys, title, description } = config;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} 
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
             <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} 
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
             <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} 
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                fill={COLORS[index % COLORS.length]} 
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );
      case 'pie':
        // For pie charts, usually we visualise the first seriesKey or a specific aggregation
        // Assuming data structure fits or taking first seriesKey
        const pieDataKey = seriesKeys[0];
        return (
          <PieChart>
             <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} 
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Legend />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={pieDataKey}
              nameKey={xAxisKey}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">{description}</p>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
