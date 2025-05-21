import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Tooltip,
  useTheme,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DownloadIcon from '@mui/icons-material/Download';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Layout from '../components/Layout';
import { 
  getTransactions, 
  getCategories,
  getAccounts,
  formatCurrency,
  getCategoryById,
  getAccountById
} from '../utils/localStorage';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Custom styled components
const ChartContainer = styled(Box)(({ theme }) => ({
  height: 400,
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const Reports = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [chartType, setChartType] = useState('pie');
  const [reportType, setReportType] = useState('expenses');
  const [categoryData, setCategoryData] = useState([]);
  const [accountData, setAccountData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  // Colors for charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042',
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#a4de6c',
    '#d0ed57',
    '#8dd1e1',
    '#83a6ed',
    '#6870c4',
    '#a4add3',
  ];

  useEffect(() => {
    // Load data
    const loadData = () => {
      const transactionsData = getTransactions();
      const categoriesData = getCategories();
      const accountsData = getAccounts();
      
      setTransactions(transactionsData);
      setCategories(categoriesData);
      setAccounts(accountsData);
    };

    loadData();
  }, []);

  useEffect(() => {
    // Filter transactions based on date range and report type
    const filterTransactionsByDate = () => {
      let start, end;
      
      // Set date range
      switch (dateRange) {
        case 'week':
          start = new Date();
          start.setDate(start.getDate() - 7);
          end = new Date();
          break;
        case 'month':
          start = new Date();
          start.setMonth(start.getMonth() - 1);
          end = new Date();
          break;
        case 'quarter':
          start = new Date();
          start.setMonth(start.getMonth() - 3);
          end = new Date();
          break;
        case 'year':
          start = new Date();
          start.setFullYear(start.getFullYear() - 1);
          end = new Date();
          break;
        case 'custom':
          start = startDate;
          end = endDate;
          break;
        default:
          start = new Date();
          start.setMonth(start.getMonth() - 1);
          end = new Date();
      }
      
      // Filter transactions by date and type
      const filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const isInDateRange = transactionDate >= start && transactionDate <= end;
        const matchesType = reportType === 'all' || transaction.type === reportType;
        const isIncludedInReports = transaction.includeInReports !== false; // Default to true if not specified
        
        return isInDateRange && matchesType && isIncludedInReports;
      });
      
      setFilteredTransactions(filtered);
      setStartDate(start);
      setEndDate(end);
    };
    
    filterTransactionsByDate();
  }, [transactions, dateRange, reportType, startDate, endDate]);

  useEffect(() => {
    // Prepare data for charts
    const prepareChartData = () => {
      // Category data
      const categoryTotals = {};
      
      filteredTransactions.forEach(transaction => {
        const categoryId = transaction.categoryId;
        if (!categoryId) return;
        
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = 0;
        }
        
        categoryTotals[categoryId] += transaction.amount;
      });
      
      const categoryChartData = Object.keys(categoryTotals).map(categoryId => {
        const category = getCategoryById(categoryId);
        return {
          name: category ? category.name : 'Uncategorized',
          value: categoryTotals[categoryId]
        };
      }).sort((a, b) => b.value - a.value);
      
      setCategoryData(categoryChartData);
      
      // Account data
      const accountTotals = {};
      
      filteredTransactions.forEach(transaction => {
        const accountId = transaction.accountId;
        if (!accountId) return;
        
        if (!accountTotals[accountId]) {
          accountTotals[accountId] = 0;
        }
        
        if (transaction.type === 'income') {
          accountTotals[accountId] += transaction.amount;
        } else {
          accountTotals[accountId] -= transaction.amount;
        }
      });
      
      const accountChartData = Object.keys(accountTotals).map(accountId => {
        const account = getAccountById(accountId);
        return {
          name: account ? account.name : 'Unknown Account',
          value: accountTotals[accountId]
        };
      });
      
      setAccountData(accountChartData);
      
      // Time series data
      const timeData = {};
      
      filteredTransactions.forEach(transaction => {
        const date = new Date(transaction.date);
        let timeKey;
        
        // Group by appropriate time period based on date range
        if (dateRange === 'week' || dateRange === 'month') {
          // Group by day for week and month views
          timeKey = date.toISOString().split('T')[0];
        } else if (dateRange === 'quarter') {
          // Group by week for quarter view
          const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
          timeKey = `${date.getFullYear()}-${date.getMonth() + 1}-W${weekNumber}`;
        } else {
          // Group by month for year and custom views
          timeKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        }
        
        if (!timeData[timeKey]) {
          timeData[timeKey] = {
            time: timeKey,
            income: 0,
            expense: 0,
            net: 0
          };
        }
        
        if (transaction.type === 'income') {
          timeData[timeKey].income += transaction.amount;
        } else {
          timeData[timeKey].expense += transaction.amount;
        }
        
        timeData[timeKey].net = timeData[timeKey].income - timeData[timeKey].expense;
      });
      
      // Convert to array and sort by time
      const timeSeriesArray = Object.values(timeData).sort((a, b) => {
        return a.time.localeCompare(b.time);
      });
      
      // Format time labels based on date range
      timeSeriesArray.forEach(item => {
        if (dateRange === 'week' || dateRange === 'month') {
          // Format as "Jan 1" for day view
          const date = new Date(item.time);
          item.timeLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } else if (dateRange === 'quarter') {
          // Format as "Jan W1" for week view
          const [year, month, week] = item.time.split(/[-W]/);
          const monthName = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'short' });
          item.timeLabel = `${monthName} W${week}`;
        } else {
          // Format as "Jan 2023" for month view
          const [year, month] = item.time.split('-');
          const monthName = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'short' });
          item.timeLabel = `${monthName} ${year}`;
        }
      });
      
      setTimeSeriesData(timeSeriesArray);
    };
    
    prepareChartData();
  }, [filteredTransactions, dateRange]);

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netAmount = totalIncome - totalExpense;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="subtitle2">{payload[0].name}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {formatCurrency(payload[0].value)}
          </Typography>
          {payload[0].payload && payload[0].payload.percentage && (
            <Typography variant="body2" color="text.secondary">
              {payload[0].payload.percentage.toFixed(1)}%
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  // Custom tooltip for time series
  const TimeTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry, index) => (
            <Typography 
              key={`tooltip-${index}`}
              variant="body2" 
              sx={{ 
                fontWeight: 'medium',
                color: entry.color
              }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Render appropriate chart based on type
  const renderChart = () => {
    // Prepare data with percentages for pie chart
    const prepareDataWithPercentages = (data) => {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      return data.map(item => ({
        ...item,
        percentage: (item.value / total) * 100
      }));
    };

    // Determine which data to use based on report type
    let chartData;
    if (reportType === 'accounts') {
      chartData = accountData;
    } else {
      chartData = categoryData;
    }

    // Add percentages for pie charts
    if (chartType === 'pie') {
      chartData = prepareDataWithPercentages(chartData);
    }

    // Render empty state if no data
    if (chartData.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography variant="h6" color="text.secondary">
            No data available for the selected period
          </Typography>
        </Box>
      );
    }

    // Render pie chart
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Render bar chart
    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 100,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value, true)}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill={theme.palette.primary.main}
              name={reportType === 'income' ? 'Income' : reportType === 'expense' ? 'Expense' : 'Amount'}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Render time series chart
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timeSeriesData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timeLabel" 
              angle={-45} 
              textAnchor="end" 
              height={60} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value, true)}
            />
            <RechartsTooltip content={<TimeTooltip />} />
            <Legend />
            {(reportType === 'income' || reportType === 'all') && (
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke={theme.palette.success.main} 
                activeDot={{ r: 8 }}
                name="Income"
              />
            )}
            {(reportType === 'expense' || reportType === 'all') && (
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke={theme.palette.error.main} 
                activeDot={{ r: 8 }}
                name="Expense"
              />
            )}
            {reportType === 'all' && (
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke={theme.palette.primary.main} 
                activeDot={{ r: 8 }}
                name="Net"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Reports
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => {
              // In a real app, this would generate and download a PDF or CSV
              alert('This would download a report in a real app');
            }}
          >
            Export Report
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                bgcolor: 'success.main',
                color: 'white',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8
                }
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  Income
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(totalIncome)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                bgcolor: 'error.main',
                color: 'white',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8
                }
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  Expenses
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(totalExpense)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                bgcolor: netAmount >= 0 ? 'primary.main' : 'warning.main',
                color: 'white',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8
                }
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  Net
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(netAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Report Controls */}
        <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  <MenuItem value="all">All Transactions</MenuItem>
                  <MenuItem value="income">Income Only</MenuItem>
                  <MenuItem value="expense">Expenses Only</MenuItem>
                  <MenuItem value="accounts">By Account</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                  <MenuItem value="quarter">Last 3 Months</MenuItem>
                  <MenuItem value="year">Last 12 Months</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {dateRange === 'custom' && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newDate) => setStartDate(newDate)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newDate) => setEndDate(newDate)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </LocalizationProvider>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Tabs
                  value={chartType}
                  onChange={(e, newValue) => setChartType(newValue)}
                  aria-label="chart type tabs"
                >
                  <Tab 
                    icon={<PieChartIcon />} 
                    label="Pie Chart" 
                    value="pie" 
                  />
                  <Tab 
                    icon={<BarChartIcon />} 
                    label="Bar Chart" 
                    value="bar" 
                  />
                  <Tab 
                    icon={<TrendingUpIcon />} 
                    label="Time Series" 
                    value="line" 
                  />
                </Tabs>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Chart */}
        <ChartContainer>
          {renderChart()}
        </ChartContainer>

        {/* Transaction List Summary */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Transaction Summary
        </Typography>
        
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {filteredTransactions.length > 0 ? (
            <List sx={{ p: 0 }}>
              {/* Show top 5 transactions by amount */}
              {filteredTransactions
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{ 
                        py: 2,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemText
                        primary={transaction.description}
                        secondary={
                          <>
                            {new Date(transaction.date).toLocaleDateString()} • 
                            {getCategoryById(transaction.categoryId)?.name || 'Uncategorized'} • 
                            {getAccountById(transaction.accountId)?.name || 'Unknown Account'}
                          </>
                        }
                      />
                      <Box sx={{ ml: 2, textAlign: 'right' }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: transaction.type === 'income' ? 'success.main' : 'error.main'
                          }}
                        >
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))
              }
            </List>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Transactions Found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                No transactions match your selected criteria
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Layout>
  );
};

export default Reports;
