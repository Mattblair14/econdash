import React, { useEffect, useState } from "react";
const Card = ({ children, className }) => <div className={`rounded-xl shadow-md p-4 bg-zinc-900 border border-zinc-800 ${className}`}>{children}</div>;
const CardContent = ({ children, className }) => <div className={`space-y-3 ${className}`}>{children}</div>;
const Badge = ({ children, className }) => <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${className}`}>{children}</span>;
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceArea } from 'recharts';

const indicators = [
  { category: "Growth", name: "GDP Growth", key: "gdp", unit: "% annualized", thresholds: { green: 2.0, yellow: 0.5 } },
  { category: "Labor Market", name: "Unemployment Rate", key: "unemployment", unit: "%", thresholds: { green: 4.5, yellow: 6.0 }, inverse: true },
  { category: "Prices", name: "Inflation Rate (CPI)", key: "inflation", unit: "% YoY", thresholds: { green: 2.0, yellow: 4.0 }, inverse: true },
  { category: "Confidence", name: "Consumer Confidence Index", key: "confidence", unit: "pts", thresholds: { green: 100, yellow: 80 } },
  { category: "Monetary Policy", name: "Federal Funds Rate", key: "fedfunds", unit: "%", thresholds: { green: 1.5, yellow: 0.5 } },
  { category: "Labor Market", name: "Labor Force Participation Rate", key: "lfpr", unit: "%", thresholds: { green: 63.5, yellow: 61 } },
  { category: "Trade", name: "Net Exports (Trade Balance)", key: "trade", unit: "$B", thresholds: { green: -500, yellow: -700 }, inverse: true }
];

const getStatusColor = (value, { green, yellow }, inverse = false) => {
  if (inverse) {
    if (value <= green) return "green";
    if (value <= yellow) return "yellow";
    return "red";
  }
  if (value >= green) return "green";
  if (value >= yellow) return "yellow";
  return "red";
};

const getProximity = (value, { green, yellow }, inverse = false) => {
  const zones = inverse ? [Number.NEGATIVE_INFINITY, green, yellow, Number.POSITIVE_INFINITY] : [Number.NEGATIVE_INFINITY, yellow, green, Number.POSITIVE_INFINITY];
  const labels = inverse ? ["Green", "Yellow", "Red"] : ["Red", "Yellow", "Green"];
  const idx = value <= zones[1] ? 0 : value <= zones[2] ? 1 : 2;
  const lower = zones[idx];
  const upper = zones[idx + 1];
  const range = upper - lower;
  const pos = inverse ? upper - value : value - lower;
  const proximity = range === 0 ? 100 : Math.round((pos / range) * 100);
  return { text: `${proximity}% into ${labels[idx]} zone`, percentage: proximity, zone: labels[idx] };
};

const IndicatorBadge = ({ status }) => {
  const colorClass = {
    green: "bg-green-500",
    yellow: "bg-yellow-400",
    red: "bg-red-500",
  }[status];
  return <Badge className={`${colorClass} text-white text-xs py-1 px-2 rounded-full`}>{status.toUpperCase()}</Badge>;
};

const TrafficLightBar = ({ value, thresholds, inverse }) => {
  const min = Math.min(value, inverse ? thresholds.green - 2 : thresholds.yellow - 2);
  const max = Math.max(value, inverse ? thresholds.yellow + 2 : thresholds.green + 2);
  const range = max - min;
  const pct = Math.min(100, Math.max(0, ((inverse ? max - value : value - min) / range) * 100));
  return (
    <div className="relative w-full h-4 rounded-full overflow-hidden bg-gray-700 mt-2">
      <div className="flex w-full h-full">
        <div className="bg-red-500 w-1/3"></div>
        <div className="bg-yellow-400 w-1/3"></div>
        <div className="bg-green-500 w-1/3"></div>
      </div>
      <div
        className="absolute top-0 h-4 w-1 bg-white"
        style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
      ></div>
    </div>
  );
};

const dummyData = {
  latest: {
    gdp: 1.9,
    unemployment: 3.8,
    inflation: 3.1,
    confidence: 85,
    fedfunds: 5.25,
    lfpr: 62.8,
    trade: -650
  },
  history: Object.fromEntries(
    ["gdp", "unemployment", "inflation", "confidence", "fedfunds", "lfpr", "trade"].map(key => [
      key,
      Array.from({ length: 20 }, (_, i) => ({ date: `202${i % 10}`, value: 50 + Math.random() * 50 }))
    ])
  )
};

export default function EconomicDashboard() {
  const [data, setData] = useState(dummyData);

  const groupedIndicators = indicators.reduce((acc, ind) => {
    acc[ind.category] = acc[ind.category] || [];
    acc[ind.category].push(ind);
    return acc;
  }, {});

  return (
    <div className="bg-black text-white min-h-screen">
      <header className="text-center py-6 border-b border-gray-700 mb-6">
        <h1 className="text-4xl font-bold tracking-tight">Economic Health Dashboard</h1>
        <p className="text-sm text-gray-400 mt-2">Created by: Matt Blair (Mattblair2016@gmail.com), San Francisco, 2025</p>
      </header>
      <div className="space-y-8 px-4">
        {Object.entries(groupedIndicators).map(([category, inds]) => (
          <div key={category}>
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2 text-white tracking-wide">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inds.map(({ name, key, thresholds, inverse, unit }) => {
                const value = data.latest[key];
                const history = data.history[key];
                const status = getStatusColor(value, thresholds, inverse);
                const proximity = getProximity(value, thresholds, inverse);
                return (
                  <Card key={key}>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-white tracking-tight">{name}</div>
                        <IndicatorBadge status={status} />
                      </div>
                      <div className="text-3xl font-bold text-white">{value} {unit}</div>
                      <div className="text-sm text-gray-300">{proximity.text}</div>
                      <TrafficLightBar value={value} thresholds={thresholds} inverse={inverse} />
                      <div className="text-xs text-gray-500 italic">Green ≥ {thresholds.green}{unit}, Yellow ≥ {thresholds.yellow}{unit}</div>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={history.slice(-20)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" angle={-45} textAnchor="end" interval={4} height={50} stroke="#ccc" fontSize={11} />
                            <YAxis domain={['auto', 'auto']} tickFormatter={(v) => `${v}${unit}`} stroke="#ccc" fontSize={11} />
                            <Tooltip formatter={(v) => `${v} ${unit}`} contentStyle={{ backgroundColor: '#222', borderColor: '#555' }} labelStyle={{ color: '#fff' }} />
                            <Legend />
                            <ReferenceArea y1={inverse ? -Infinity : thresholds.yellow} y2={inverse ? thresholds.yellow : thresholds.green} fill="#facc15" fillOpacity={0.1} />
                            <ReferenceArea y1={inverse ? thresholds.yellow : thresholds.green} y2={inverse ? thresholds.green : Infinity} fill="#22c55e" fillOpacity={0.1} />
                            <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} dot={false} name={name} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
