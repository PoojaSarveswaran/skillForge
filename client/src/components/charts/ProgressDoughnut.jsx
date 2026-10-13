import { Doughnut } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { CHART_COLORS, CHART_TEXT_COLOR } from '../../utils/chartSetup';

export default function ProgressDoughnut({ completed, inProgress, todo }) {
  const data = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [completed, inProgress, todo],
        backgroundColor: [CHART_COLORS.success, CHART_COLORS.accent, 'rgba(154,166,196,0.25)'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { color: CHART_TEXT_COLOR, boxWidth: 10, padding: 14 } },
    },
  };

  return (
    <div style={{ height: 200 }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
