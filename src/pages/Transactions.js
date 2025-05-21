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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Tooltip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  InputAdornment,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Layout from '../components/Layout';
import { 
  getTransactions, 
  saveTransactions,
  getAccounts,
  getCategories,
  formatCurrency,
  generateId,
  getAccountById,
  getCategoryById
} from '../utils/localStorage';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [includeInReports, setIncludeInReports] = useState(true);
  const [notes, setNotes] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);
  const [filterIncludeInReports, setFilterIncludeInReports] = useState(null);
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    // Load data
    const loadData = () => {
      const transactionsData = getTransactions();
      const accountsData = getAccounts();
      const categoriesData = getCategories();
      
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
    };

    loadData();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...transactions];
    
    // Search term
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Transaction type
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }
    
    // Category
    if (filterCategory) {
      filtered = filtered.filter(transaction => transaction.categoryId === filterCategory);
    }
    
    // Account
    if (filterAccount) {
      filtered = filtered.filter(transaction => transaction.accountId === filterAccount);
    }
    
    // Date range
    if (filterDateFrom) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= new Date(filterDateFrom)
      );
    }
    
    if (filterDateTo) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) <= new Date(filterDateTo)
      );
    }
    
    // Include in reports
    if (filterIncludeInReports !== null) {
      filtered = filtered.filter(transaction => 
        transaction.includeInReports === filterIncludeInReports
      );
    }
    
    // Sorting
    switch (sortBy) {
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'amount-asc':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      case 'amount-desc':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'description-asc':
        filtered.sort((a, b) => a.description.localeCompare(b.description));
        break;
      case 'description-desc':
        filtered.sort((a, b) => b.description.localeCompare(a.description));
        break;
      default:
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    setFilteredTransactions(filtered);
  }, [
    transactions, 
    searchTerm, 
    filterType, 
    filterCategory, 
    filterAccount, 
    filterDateFrom, 
    filterDateTo, 
    filterIncludeInReports,
    sortBy
  ]);

  const handleOpenTransactionDialog = (transaction = null) => {
    if (transaction) {
      setCurrentTransaction(transaction);
      setTransactionType(transaction.type);
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      setDate(new Date(transaction.date));
      setAccountId(transaction.accountId);
      setCategoryId(transaction.categoryId);
      setIncludeInReports(transaction.includeInReports);
      setNotes(transaction.notes || '');
    } else {
      setCurrentTransaction(null);
      setTransactionType('expense');
      setDescription('');
      setAmount('');
      setDate(new Date());
      setAccountId(accounts.length > 0 ? accounts[0].id : '');
      setCategoryId('');
      setIncludeInReports(true);
      setNotes('');
    }
    setOpenTransactionDialog(true);
  };

  const handleCloseTransactionDialog = () => {
    setOpenTransactionDialog(false);
  };

  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false);
  };

  const handleSaveTransaction = () => {
    if (!description.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a description',
        severity: 'error'
      });
      return;
    }

    if (!accountId) {
      setSnackbar({
        open: true,
        message: 'Please select an account',
        severity: 'error'
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid amount',
        severity: 'error'
      });
      return;
    }

    const transactionData = {
      id: currentTransaction ? currentTransaction.id : generateId(),
      type: transactionType,
      description,
      amount: parsedAmount,
      date: date.toISOString(),
      accountId,
      categoryId,
      includeInReports,
      notes
    };

    let updatedTransactions;
    let updatedAccounts = [...accounts];
    const account = updatedAccounts.find(acc => acc.id === accountId);
    
    if (currentTransaction) {
      // Update existing transaction
      
      // Revert previous transaction effect on account balance
      const oldAccount = updatedAccounts.find(acc => acc.id === currentTransaction.accountId);
      if (oldAccount) {
        if (currentTransaction.type === 'income') {
          oldAccount.balance -= currentTransaction.amount;
        } else {
          oldAccount.balance += currentTransaction.amount;
        }
      }
      
      // Apply new transaction effect on account balance
      if (account) {
        if (transactionType === 'income') {
          account.balance += parsedAmount;
        } else {
          account.balance -= parsedAmount;
        }
      }
      
      updatedTransactions = transactions.map(t => 
        t.id === currentTransaction.id ? transactionData : t
      );
      
      setSnackbar({
        open: true,
        message: 'Transaction updated successfully',
        severity: 'success'
      });
    } else {
      // Add new transaction
      
      // Apply transaction effect on account balance
      if (account) {
        if (transactionType === 'income') {
          account.balance += parsedAmount;
        } else {
          account.balance -= parsedAmount;
        }
      }
      
      updatedTransactions = [...transactions, transactionData];
      
      setSnackbar({
        open: true,
        message: 'Transaction added successfully',
        severity: 'success'
      });
    }
    
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    
    // Update accounts
    setAccounts(updatedAccounts);
    
    handleCloseTransactionDialog();
  };

  const handleDeleteTransaction = (transactionId) => {
    const transactionToDelete = transactions.find(t => t.id === transactionId);
    if (!transactionToDelete) return;
    
    // Update account balance
    const updatedAccounts = [...accounts];
    const account = updatedAccounts.find(acc => acc.id === transactionToDelete.accountId);
    if (account) {
      if (transactionToDelete.type === 'income') {
        account.balance -= transactionToDelete.amount;
      } else {
        account.balance += transactionToDelete.amount;
      }
    }
    setAccounts(updatedAccounts);
    
    // Remove transaction
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    
    setSnackbar({
      open: true,
      message: 'Transaction deleted successfully',
      severity: 'success'
    });
  };

  const handleApplyFilters = () => {
    handleCloseFilterDialog();
  };

  const handleResetFilters = () => {
    setFilterType('all');
    setFilterCategory('');
    setFilterAccount('');
    setFilterDateFrom(null);
    setFilterDateTo(null);
    setFilterIncludeInReports(null);
    setSearchTerm('');
    setSortBy('date-desc');
    handleCloseFilterDialog();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netAmount = totalIncome - totalExpense;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Transactions
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={handleOpenFilterDialog}
              sx={{ mr: 2 }}
            >
              Filter
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenTransactionDialog()}
            >
              Add Transaction
            </Button>
          </Box>
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

        {/* Search and Sort */}
        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            placeholder="Search transactions..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2 }}
          />
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="date-desc">Date (Newest First)</MenuItem>
              <MenuItem value="date-asc">Date (Oldest First)</MenuItem>
              <MenuItem value="amount-desc">Amount (Highest First)</MenuItem>
              <MenuItem value="amount-asc">Amount (Lowest First)</MenuItem>
              <MenuItem value="description-asc">Description (A-Z)</MenuItem>
              <MenuItem value="description-desc">Description (Z-A)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Active Filters */}
        {(filterType !== 'all' || filterCategory || filterAccount || filterDateFrom || filterDateTo || filterIncludeInReports !== null) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {filterType !== 'all' && (
              <Chip 
                label={`Type: ${filterType === 'income' ? 'Income' : 'Expense'}`} 
                onDelete={() => setFilterType('all')} 
                color="primary" 
                variant="outlined"
              />
            )}
            {filterCategory && (
              <Chip 
                label={`Category: ${getCategoryById(filterCategory)?.name || 'Unknown'}`} 
                onDelete={() => setFilterCategory('')} 
                color="primary" 
                variant="outlined"
              />
            )}
            {filterAccount && (
              <Chip 
                label={`Account: ${getAccountById(filterAccount)?.name || 'Unknown'}`} 
                onDelete={() => setFilterAccount('')} 
                color="primary" 
                variant="outlined"
              />
            )}
            {filterDateFrom && (
              <Chip 
                label={`From: ${new Date(filterDateFrom).toLocaleDateString()}`} 
                onDelete={() => setFilterDateFrom(null)} 
                color="primary" 
                variant="outlined"
              />
            )}
            {filterDateTo && (
              <Chip 
                label={`To: ${new Date(filterDateTo).toLocaleDateString()}`} 
                onDelete={() => setFilterDateTo(null)} 
                color="primary" 
                variant="outlined"
              />
            )}
            {filterIncludeInReports !== null && (
              <Chip 
                label={`In Reports: ${filterIncludeInReports ? 'Yes' : 'No'}`} 
                onDelete={() => setFilterIncludeInReports(null)} 
                color="primary" 
                variant="outlined"
              />
            )}
            <Chip 
              label="Reset All" 
              onClick={handleResetFilters} 
              color="secondary" 
            />
          </Box>
        )}

        {/* Transactions List */}
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {filteredTransactions.length > 0 ? (
            <List sx={{ p: 0 }}>
              {filteredTransactions.map((transaction, index) => {
                const account = getAccountById(transaction.accountId);
                const category = getCategoryById(transaction.categoryId);
                
                return (
                  <React.Fragment key={transaction.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton 
                            edge="end" 
                            aria-label="edit"
                            onClick={() => handleOpenTransactionDialog(transaction)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                      sx={{ 
                        py: 2,
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
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                              {transaction.description}
                            </Typography>
                            {!transaction.includeInReports && (
                              <Chip 
                                label="Not in Reports" 
                                size="small" 
                                sx={{ ml: 1 }} 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(transaction.date).toLocaleDateString()} • {account?.name || 'Unknown Account'}
                            </Typography>
                            {category && (
                              <Chip 
                                label={category.name} 
                                size="small" 
                                sx={{ mt: 0.5, maxWidth: 'fit-content' }} 
                                variant="outlined"
                              />
                            )}
                          </Box>
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
                );
              })}
            </List>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Transactions Found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {transactions.length === 0 
                  ? "You haven't added any transactions yet" 
                  : "No transactions match your filters"}
              </Typography>
              {transactions.length === 0 ? (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenTransactionDialog()}
                >
                  Add Transaction
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={openTransactionDialog} onClose={handleCloseTransactionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </DialogTitle>
        <DialogContent>
          <Tabs
            value={transactionType}
            onChange={(e, newValue) => setTransactionType(newValue)}
            sx={{ mb: 3, mt: 1 }}
          >
            <Tab 
              value="expense" 
              label="Expense" 
              icon={<ArrowDownwardIcon />} 
              iconPosition="start"
              sx={{ 
                color: 'error.main',
                '&.Mui-selected': { color: 'error.main' }
              }}
            />
            <Tab 
              value="income" 
              label="Income" 
              icon={<ArrowUpwardIcon />} 
              iconPosition="start"
              sx={{ 
                color: 'success.main',
                '&.Mui-selected': { color: 'success.main' }
              }}
            />
          </Tabs>
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Amount"
            fullWidth
            variant="outlined"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />
          </LocalizationProvider>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Account</InputLabel>
            <Select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              label="Account"
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              label="Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories
                .filter(category => category.type === transactionType)
                .map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Notes (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={includeInReports}
                onChange={(e) => setIncludeInReports(e.target.checked)}
                color="primary"
              />
            }
            label="Include in Reports"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveTransaction} 
            variant="contained"
            color={transactionType === 'income' ? 'success' : 'primary'}
          >
            {currentTransaction ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onClose={handleCloseFilterDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Transactions</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Transaction Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Account</InputLabel>
            <Select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              label="Account"
            >
              <MenuItem value="">All Accounts</MenuItem>
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DatePicker
                label="From Date"
                value={filterDateFrom}
                onChange={(newDate) => setFilterDateFrom(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="To Date"
                value={filterDateTo}
                onChange={(newDate) => setFilterDateTo(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </LocalizationProvider>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Include in Reports</InputLabel>
            <Select
              value={filterIncludeInReports === null ? '' : filterIncludeInReports}
              onChange={(e) => {
                const value = e.target.value;
                setFilterIncludeInReports(value === '' ? null : value);
              }}
              label="Include in Reports"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilters} color="secondary">
            Reset
          </Button>
          <Button onClick={handleCloseFilterDialog}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Tooltip title="Add Transaction">
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenTransactionDialog()}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Layout>
  );
};

export default Transactions;
