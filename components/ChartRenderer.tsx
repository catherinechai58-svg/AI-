import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ChartConfig } from '../types';

interface ChartRendererProps {
  config: ChartConfig;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Helper to format large numbers for axis labels (e.g. 1.2B, 500M)
const formatAxisNumber = (value: any) => {
  if (typeof value !== 'number') return value;
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value;
};

// Custom Tooltip Formatter to show full numbers with commas
const tooltipFormatter = (value: any) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US').format(value);
  }
  return value;
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({ config }) => {
  const { type, data, xAxisKey, seriesKeys, title, description } = config;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#94a3b8" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              tickFormatter={formatAxisNumber}
              width={80} // Increased width to fit labels
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', borderRadius: '8px' }} 
              itemStyle={{ color: '#cbd5e1' }}
              formatter={tooltipFormatter}
              cursor={{ fill: '#334155', opacity: 0.4 }}
            />
            {seriesKeys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={COLORS[index % COLORS.length]} 
                radius={[4, 4, 0, 0]} 
                maxBarSize={60}
              />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#94a3b8" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              tickFormatter={formatAxisNumber}
              width={80}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
             <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', borderRadius: '8px' }} 
              itemStyle={{ color: '#cbd5e1' }}
              formatter={tooltipFormatter}
            />
            {seriesKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#94a3b8" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8"
              tickFormatter={formatAxisNumber}
              width={80}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
             <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', borderRadius: '8px' }} 
              itemStyle={{ color: '#cbd5e1' }}
              formatter={tooltipFormatter}
            />
            {seriesKeys.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                fill={COLORS[index % COLORS.length]} 
                fillOpacity={0.2}
                strokeWidth={2}
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
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', borderRadius: '8px' }} 
              itemStyle={{ color: '#cbd5e1' }}
              formatter={tooltipFormatter}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              paddingAngle={5}
              dataKey={pieDataKey}
              nameKey={xAxisKey}
              stroke="none"
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
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};