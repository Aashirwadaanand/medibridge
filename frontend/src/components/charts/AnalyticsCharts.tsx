import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar
} from 'recharts';

interface VitalsChartProps {
  data: any[];
  title: string;
}

export const VitalsAreaChart: React.FC<VitalsChartProps> = ({ data, title }) => {
  return (
    <div className="glass-card p-6 rounded-2xl h-80 flex flex-col justify-between border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">{title}</h4>
        <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-medium">Real-time Telemetry</span>
      </div>
      <div className="flex-1 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              labelClassName="text-slate-400 font-sans text-xs"
            />
            <Area type="monotone" dataKey="heartRate" name="Pulse (bpm)" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorHr)" />
            <Area type="monotone" dataKey="oxygen" name="SpO2 (%)" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorOx)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface RadialChartProps {
  value: number;
  title: string;
  subtitle: string;
}

export const RadialAdherenceChart: React.FC<RadialChartProps> = ({ value, title, subtitle }) => {
  const chartData = [
    {
      name: 'Adherence',
      value: value,
      fill: 'url(#gradientGlow)'
    }
  ];

  return (
    <div className="glass-card p-6 rounded-2xl h-80 flex flex-col justify-between border border-white/5 relative overflow-hidden">
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">{title}</h4>
        <p className="text-[10px] text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[160px]">
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-white tracking-tight">{value}%</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Completed</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="95%"
            barSize={14}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <defs>
              <linearGradient id="gradientGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <RadialBar
              background={{ fill: 'rgba(255,255,255,0.03)' }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SystemActivityChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="glass-card p-6 rounded-2xl h-80 flex flex-col justify-between border border-white/5">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">{title}</h4>
      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">Server Pulse</span>
    </div>
    <div className="flex-1 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tickLine={false} />
          <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            labelClassName="text-slate-400 font-sans text-xs"
          />
          <Bar dataKey="requests" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

interface SleepChartProps {
  data: any[];
  title: string;
}

export const SleepTelemetryChart: React.FC<SleepChartProps> = ({ data, title }) => {
  return (
    <div className="glass-card p-6 rounded-2xl h-80 flex flex-col justify-between border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">{title}</h4>
        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full font-medium">Somnography Logs</span>
      </div>
      <div className="flex-1 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} domain={[0, 12]} />
            <Tooltip
              contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              labelClassName="text-slate-400 font-sans text-xs"
            />
            <Area type="monotone" dataKey="hours" name="Sleep (hrs)" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorSleep)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
