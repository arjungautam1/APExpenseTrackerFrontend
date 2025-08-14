import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { transactionService } from '../../services/transaction';
import { investmentService } from '../../services/investment';
import { useCurrencyFormatter } from '../../utils/currency';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsChartProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface ChartDataPoint {
  month: string;
  income: number;
  expenses: number;
  investments: number;
}

export function AnalyticsChart({ dateRange }: AnalyticsChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatCurrency } = useCurrencyFormatter();

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get monthly trends data for the date range
      const monthlyTrends = await transactionService.getMonthlyTrends(
        dateRange.startDate,
        dateRange.endDate
      );

      // Process the data to create chart data points
      const processedData = processMonthlyData(monthlyTrends);
      setChartData(processedData);
    } catch (error: any) {
      console.error('Failed to fetch chart data:', error);
      setError('Failed to load chart data');
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (monthlyTrends: any[]): ChartDataPoint[] => {
    return monthlyTrends.map(item => ({
      month: formatMonthLabel(item.month),
      income: item.income || 0,
      expenses: item.expenses || 0,
      investments: item.investments || 0
    }));
  };

  const formatMonthLabel = (monthKey: string): string => {
    // Convert "2024-01" to "Jan 2024"
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  useEffect(() => {
    fetchChartData();
  }, [dateRange.startDate, dateRange.endDate]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month'
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amount'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const data = {
    labels: chartData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: chartData.map(d => d.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Expenses',
        data: chartData.map(d => d.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Investments',
        data: chartData.map(d => d.investments),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading chart data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load chart</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchChartData}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Financial Trends</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Income</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Expenses</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Investments</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <Line options={chartOptions} data={data} />
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Hover over the chart to see detailed amounts for each month</p>
        </div>
      </div>
    </div>
  );
}
