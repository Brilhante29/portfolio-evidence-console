'use client';

import type { EvidenceRun } from '@/domain/evidence';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { init, use as registerECharts } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useMemo, useRef } from 'react';

registerECharts([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export function EvidenceChart({ runs, revision }: { runs: EvidenceRun[]; revision: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const projectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const run of runs) counts.set(run.project, (counts.get(run.project) ?? 0) + 1);
    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 10);
  }, [runs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = init(container, undefined, { renderer: 'canvas' });
    chart.setOption({
      animationDuration: 220,
      grid: { left: 8, right: 20, top: 16, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value: unknown) => `${String(value)} runs`,
      },
      xAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: '#64748b', fontSize: 11 },
        splitLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: projectCounts.map(([project]) => project),
        axisLabel: {
          color: '#334155',
          fontSize: 11,
          width: 150,
          overflow: 'truncate',
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: projectCounts.map(([, count]) => count),
          barMaxWidth: 20,
          itemStyle: { color: '#2563eb', borderRadius: [0, 3, 3, 0] },
        },
      ],
    });
    chart.on('finished', () => {
      container.dataset.chartRevision = String(revision);
      container.dispatchEvent(new CustomEvent('evidence-chart-finished', { bubbles: true }));
    });

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(container);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [projectCounts, revision]);

  return (
    <div
      ref={containerRef}
      className="evidence-chart"
      data-testid="evidence-chart"
      role="img"
      aria-label="Evidence run count by project"
    />
  );
}
