"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: {
      display: false, // ซ่อน Legend
    },
    tooltip: {
      backgroundColor: "#1e293b", 
      titleColor: "#f1f5f9",
      bodyColor: "#f1f5f9",
      titleFont: {
        family: "'Inter', sans-serif",
        size: 14,
        weight: "bold" as const,
      },
      bodyFont: {
        family: "'Inter', sans-serif",
        size: 13,
        weight: "normal" as const,
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: function(context: TooltipItem<'bar'>) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += '฿' + context.parsed.y.toLocaleString('th-TH');
          }
          return label;
        }
      }
    },
  },
  scales: {
    x: {
      grid: {
        display: false, // ซ่อนเส้น Grid X
      },
      ticks: {
        color: "#0f172b", // สีตัวอักษร
        font: {
          family: "'Inter', sans-serif",
          size: 12,
          weight: 500,
        },
      },
    },
    y: {
      grid: {
        color: "#d1d6e4", // สี Grid Y อ่อน ๆ
      },
      ticks: {
        color: "#0f172b",
        font: {
          family: "'Inter', sans-serif",
          size: 12,
          weight: 500,
        },
        callback: function(value) {
          return '฿' + Number(value).toLocaleString('th-TH');
        }
      },
    },
  },
};

interface ChartDataPoint {
  month: string;
  revenue: number;
}

interface ChartBarMinimalProps {
  data: ChartDataPoint[];
}

const ChartBarMinimal = ({ data }: ChartBarMinimalProps) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: "Revenue",
        data: data.map(item => item.revenue),
        backgroundColor: "#0891B2", // แท่ง
        borderRadius: 4, // ทำให้มุมแท่งมน
        barPercentage: 0.6, // ความกว้างของแท่ง
      },
    ],
  };

  return <Bar data={chartData} options={options}  />;
};

export default ChartBarMinimal;
