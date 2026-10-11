import React, { useState } from 'react';
import { SkillDimension } from '../types/index.ts';

interface RadarChartProps {
  dimensions: SkillDimension[];
  size?: number;
  showBenchmark?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  dimensions,
  size = 360,
  showBenchmark = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!dimensions || dimensions.length < 3) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Requires at least 3 skill dimensions to render radar geometry.
      </div>
    );
  }

  const center = size / 2;
  const radius = size * 0.38;
  const totalAxes = dimensions.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Grid levels (25%, 50%, 75%, 100%)
  const levels = [2.5, 5.0, 7.5, 10.0];

  // Helper to convert polar to cartesian
  const getCoordinates = (value: number, index: number, max = 10) => {
    const angle = index * angleSlice - Math.PI / 2;
    const r = (value / max) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build candidate polygon
  const candidatePoints = dimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(dim.score, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Build benchmark polygon
  const benchmarkPoints = dimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(dim.benchmarkMinRequired || 7.5, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none"
      >
        {/* Background concentric polygons */}
        {levels.map((lvl) => {
          const points = dimensions
            .map((_, i) => {
              const { x, y } = getCoordinates(lvl, i);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={`level-${lvl}`}
              points={points}
              fill={lvl === 10 ? '#f8fafc' : 'none'}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={lvl < 10 ? '2 2' : undefined}
            />
          );
        })}

        {/* Axes lines */}
        {dimensions.map((dim, i) => {
          const { x, y } = getCoordinates(10, i);
          const angle = i * angleSlice - Math.PI / 2;
          const labelDist = radius + 24;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          const isHovered = hoveredIndex === i;

          return (
            <g key={`axis-${dim.name}`}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={lx}
                y={ly}
                textAnchor={
                  Math.abs(Math.cos(angle)) < 0.2
                    ? 'middle'
                    : Math.cos(angle) > 0
                    ? 'start'
                    : 'end'
                }
                dominantBaseline="central"
                className={`text-[11px] font-medium transition-colors cursor-pointer ${
                  isHovered ? 'fill-indigo-900 font-bold' : 'fill-slate-600'
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {dim.name.length > 20 ? `${dim.name.slice(0, 18)}…` : dim.name}
              </text>
            </g>
          );
        })}

        {/* Benchmark Polygon (Target Standard) */}
        {showBenchmark && (
          <polygon
            points={benchmarkPoints}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />
        )}

        {/* Candidate Polygon */}
        <polygon
          points={candidatePoints}
          fill="rgba(79, 70, 229, 0.16)"
          stroke="#4f46e5"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Data points */}
        {dimensions.map((dim, i) => {
          const { x, y } = getCoordinates(dim.score, i);
          const isHovered = hoveredIndex === i;
          return (
            <g key={`point-${dim.name}`}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 6 : 4.5}
                fill={dim.score >= (dim.benchmarkMinRequired || 7.5) ? '#10b981' : '#4f46e5'}
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Interactive Tooltip Card */}
      {hoveredIndex !== null && dimensions[hoveredIndex] && (
        <div className="mt-2 w-full max-w-xs rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs text-xs animate-in fade-in duration-100">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>{dimensions[hoveredIndex].name}</span>
            <span className="font-mono tabular-nums text-indigo-600">
              {dimensions[hoveredIndex].score.toFixed(1)} / 10
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-slate-500 text-[11px]">
            <span>Target Benchmark:</span>
            <span className="font-mono tabular-nums">
              {(dimensions[hoveredIndex].benchmarkMinRequired || 7.5).toFixed(1)} / 10
            </span>
          </div>
          <div className="mt-1.5 text-slate-600 leading-relaxed text-[11px]">
            {dimensions[hoveredIndex].description}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
          <span>Candidate Verified Score</span>
        </div>
        {showBenchmark && (
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-3.5 border-t-2 border-dashed border-slate-400" />
            <span>Target Industry Benchmark</span>
          </div>
        )}
      </div>
    </div>
  );
};
