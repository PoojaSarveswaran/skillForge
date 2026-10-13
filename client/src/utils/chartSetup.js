import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export const CHART_TEXT_COLOR = '#9aa6c4';
export const CHART_GRID_COLOR = 'rgba(37, 49, 80, 0.6)';
export const CHART_COLORS = {
  accent: '#3b82f6',
  teal: '#14b8a6',
  violet: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  critical: '#ef4444',
};
