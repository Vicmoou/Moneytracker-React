import React, { useState, useEffect } from 'react';
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
  ListItemIcon,
  IconButton,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Layout from '../components/Layout';
import { 
  getAccounts, 
  getTransactions, 
  getShoppingList, 
  getBudgets,
  formatCurrency,
  getCategoryById
} from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Load data
    const loadData = () => {
      const accountsData = getAccounts();
      const transactionsData = getTransactions();
      const shoppingListData = getShoppingList();
      const budgetsData = getBudgets();

      setAccounts(accountsData);
      setTransactions(transactionsData);
      setShoppingList(shoppingListData);
      setBudgets(budgetsData);

      // Calculate totals
      const balance = accountsData.reduce((total, account) => total + account.balance, 0);
      setTotalBalance(balance);

      // Calculate income and expense for current month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyTransactions = transactionsData.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });

      const income = monthlyTransactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);
      
      const expense = monthlyTransactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

      setTotalIncome(income);
      setTotalExpense(expense);
    };

    loadData();
  }, []);

  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Get upcoming shopping items
  const upcomingItems = [...shoppingList]
    .filter(item => item.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="text.secondary">
                    Balance
                  </Typography>
                  <AccountBalanceWalletIcon color="primary" fontSize="large" />
                </Box>
                <Typography variant="h4" component="div">
                  {formatCurrency(totalBalance)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Total across all accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="text.secondary">
                    Income
                  </Typography>
                  <TrendingUpIcon sx={{ color: 'success.main' }} fontSize="large" />
                </Box>
                <Typography variant="h4" component="div" color="success.main">
                  {formatCurrency(totalIncome)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="text.secondary">
                    Expenses
                  </Typography>
                  <TrendingDownIcon sx={{ color: 'error.main' }} fontSize="large" />
                </Box>
                <Typography variant="h4" component="div" color="error.main">
                  {formatCurrency(totalExpense)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="text.secondary">
                    Planned
                  </Typography>
                  <ShoppingCartIcon color="info" fontSize="large" />
                </Box>
                <Typography variant="h4" component="div" color="info.main">
                  {formatCurrency(shoppingList.reduce((total, item) => total + item.amount, 0))}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {shoppingList.length} items in shopping list
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Accounts and Recent Transactions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Accounts
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => navigate('/accounts')}
                >
                  Add
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {accounts.map((account) => (
                  <ListItem 
                    key={account.id}
                    secondaryAction={
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {formatCurrency(account.balance)}
                      </Typography>
                    }
                    sx={{ 
                      py: 1.5,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <AccountBalanceWalletIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={account.name}
                    />
                  </ListItem>
                ))}
                
                {accounts.length === 0 && (
                  <ListItem>
                    <ListItemText 
                      primary="No accounts found"
                      secondary="Add an account to get started"
                    />
                  </ListItem>
                )}
              </List>
              
              {accounts.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/accounts')}
                  >
                    View All
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Transactions
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => navigate('/transactions')}
                >
                  Add
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {recentTransactions.map((transaction) => {
                  const category = getCategoryById(transaction.categoryId);
                  return (
                    <ListItem 
                      key={transaction.id}
                      secondaryAction={
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 'medium',
                            color: transaction.type === 'income' ? 'success.main' : 'error.main'
                          }}
                        >
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </Typography>
                      }
                      sx={{ 
                        py: 1.5,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemIcon>
                        {transaction.type === 'income' ? (
                          <ArrowUpwardIcon sx={{ color: 'success.main' }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ color: 'error.main' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={transaction.description}
                        secondary={
                          <>
                            {new Date(transaction.date).toLocaleDateString()} • {category?.name || 'Uncategorized'}
                          </>
                        }
                      />
                    </ListItem>
                  );
                })}
                
                {recentTransactions.length === 0 && (
                  <ListItem>
                    <ListItemText 
                      primary="No transactions found"
                      secondary="Add a transaction to get started"
                    />
                  </ListItem>
                )}
              </List>
              
              {recentTransactions.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/transactions')}
                  >
                    View All
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Shopping List Preview */}
        {upcomingItems.length > 0 && (
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              mt: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Upcoming Planned Transactions
              </Typography>
              <Button 
                variant="text" 
                onClick={() => navigate('/shopping-list')}
              >
                View All
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {upcomingItems.map((item) => {
                const category = getCategoryById(item.categoryId);
                return (
                  <Grid item xs={12} sm={4} key={item.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: 2,
                        borderLeft: 6,
                        borderColor: item.priority === 'high' ? 'error.main' : 
                                    item.priority === 'medium' ? 'warning.main' : 'primary.main'
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" component="div" noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Due: {new Date(item.date).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Chip 
                            label={category?.name || 'Uncategorized'} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(item.amount)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}
      </Box>
    </Layout>
  );
};

export default Dashboard;
