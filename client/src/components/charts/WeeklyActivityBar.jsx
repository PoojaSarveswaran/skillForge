import { Bar } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { CHART_COLORS, CHART_GRID_COLOR, CHART_TEXT_COLOR } from '../../utils/chartSetup';

function lastSevenDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export default function WeeklyActivityBar({ activity }) {
  const days = lastSevenDays();
  const countByDay = new Map((activity || []).map((a) => [a.day instanceof Date ? a.day.toISOString().slice(0, 10) : String(a.day).slice(0, 10), a.count]));

  const labels = days.map((d) => d.toLocaleDateString(undefined, { weekday: 'short' }));
  const values = days.map((d) => countByDay.get(d.toISOString().slice(0, 10)) || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Activity',
        data: values,
        backgroundColor: CHART_COLORS.violet,
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: CHART_TEXT_COLOR } },
      y: { beginAtZero: true, ticks: { stepSize: 1, color: CHART_TEXT_COLOR }, grid: { color: CHART_GRID_COLOR } },
    },
  };

  return (
    <div style={{ height: 200 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
