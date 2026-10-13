import { Radar } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { CHART_TEXT_COLOR, CHART_GRID_COLOR, CHART_COLORS } from '../../utils/chartSetup';

export default function SkillRadarChart({ labels, current, target }) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Current',
        data: current,
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
        borderColor: CHART_COLORS.accent,
        pointBackgroundColor: CHART_COLORS.accent,
      },
      {
        label: 'Target',
        data: target,
        backgroundColor: 'rgba(20, 184, 166, 0.12)',
        borderColor: CHART_COLORS.teal,
        pointBackgroundColor: CHART_COLORS.teal,
        borderDash: [4, 4],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 4,
        ticks: { stepSize: 1, color: CHART_TEXT_COLOR, backdropColor: 'transparent' },
        grid: { color: CHART_GRID_COLOR },
        angleLines: { color: CHART_GRID_COLOR },
        pointLabels: { color: CHART_TEXT_COLOR, font: { size: 11 } },
      },
    },
    plugins: {
      legend: { labels: { color: CHART_TEXT_COLOR }, position: 'bottom' },
    },
  };

  return (
    <div style={{ height: 260 }}>
      <Radar data={data} options={options} />
    </div>
  );
}
