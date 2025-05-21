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
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Layout from '../components/Layout';
import { 
  getAccounts, 
  saveAccounts,
  formatCurrency,
  generateId
} from '../utils/localStorage';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [accountIcon, setAccountIcon] = useState('account_balance_wallet');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [totalBalance, setTotalBalance] = useState(0);

  // Icons for accounts
  const accountIcons = [
    { value: 'account_balance_wallet', label: 'Wallet' },
    { value: 'account_balance', label: 'Bank' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'savings', label: 'Savings' },
    { value: 'payments', label: 'Cash' },
  ];

  useEffect(() => {
    // Load accounts
    const loadAccounts = () => {
      const accountsData = getAccounts();
      setAccounts(accountsData);
      
      // Calculate total balance
      const total = accountsData.reduce((sum, account) => sum + account.balance, 0);
      setTotalBalance(total);
    };

    loadAccounts();
  }, []);

  const handleOpenAccountDialog = (account = null) => {
    if (account) {
      setCurrentAccount(account);
      setAccountName(account.name);
      setAccountBalance(account.balance.toString());
      setAccountIcon(account.icon || 'account_balance_wallet');
    } else {
      setCurrentAccount(null);
      setAccountName('');
      setAccountBalance('');
      setAccountIcon('account_balance_wallet');
    }
    setOpenAccountDialog(true);
  };

  const handleCloseAccountDialog = () => {
    setOpenAccountDialog(false);
  };

  const handleOpenTransferDialog = () => {
    setFromAccount('');
    setToAccount('');
    setTransferAmount('');
    setOpenTransferDialog(true);
  };

  const handleCloseTransferDialog = () => {
    setOpenTransferDialog(false);
  };

  const handleSaveAccount = () => {
    if (!accountName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter an account name',
        severity: 'error'
      });
      return;
    }

    const balance = parseFloat(accountBalance) || 0;

    if (currentAccount) {
      // Update existing account
      const updatedAccounts = accounts.map(acc => 
        acc.id === currentAccount.id 
          ? { ...acc, name: accountName, balance, icon: accountIcon }
          : acc
      );
      setAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
      setSnackbar({
        open: true,
        message: 'Account updated successfully',
        severity: 'success'
      });
    } else {
      // Add new account
      const newAccount = {
        id: generateId(),
        name: accountName,
        balance,
        icon: accountIcon
      };
      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
      setSnackbar({
        open: true,
        message: 'Account added successfully',
        severity: 'success'
      });
    }

    // Recalculate total balance
    const total = accounts.reduce((sum, account) => sum + account.balance, 0) + 
      (currentAccount ? 0 : parseFloat(accountBalance) || 0);
    setTotalBalance(total);

    handleCloseAccountDialog();
  };

  const handleDeleteAccount = (accountId) => {
    const accountToDelete = accounts.find(acc => acc.id === accountId);
    if (!accountToDelete) return;

    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);

    // Recalculate total balance
    const total = updatedAccounts.reduce((sum, account) => sum + account.balance, 0);
    setTotalBalance(total);

    setSnackbar({
      open: true,
      message: 'Account deleted successfully',
      severity: 'success'
    });
  };

  const handleTransfer = () => {
    if (!fromAccount || !toAccount) {
      setSnackbar({
        open: true,
        message: 'Please select both accounts',
        severity: 'error'
      });
      return;
    }

    if (fromAccount === toAccount) {
      setSnackbar({
        open: true,
        message: 'Cannot transfer to the same account',
        severity: 'error'
      });
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid amount',
        severity: 'error'
      });
      return;
    }

    const sourceAccount = accounts.find(acc => acc.id === fromAccount);
    if (sourceAccount.balance < amount) {
      setSnackbar({
        open: true,
        message: 'Insufficient balance in source account',
        severity: 'error'
      });
      return;
    }

    const updatedAccounts = accounts.map(acc => {
      if (acc.id === fromAccount) {
        return { ...acc, balance: acc.balance - amount };
      }
      if (acc.id === toAccount) {
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    });

    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
    setSnackbar({
      open: true,
      message: 'Transfer completed successfully',
      severity: 'success'
    });
    handleCloseTransferDialog();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Accounts
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<CompareArrowsIcon />}
              onClick={handleOpenTransferDialog}
              sx={{ mr: 2 }}
              disabled={accounts.length < 2}
            >
              Transfer
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenAccountDialog()}
            >
              Add Account
            </Button>
          </Box>
        </Box>

        {/* Total Balance Card */}
        <Card 
          elevation={2}
          sx={{ 
            mb: 4,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'white',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 8
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, opacity: 0.8 }}>
              Total Balance
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(totalBalance)}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </Typography>
          </CardContent>
        </Card>

        {/* Accounts Grid */}
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 8
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalanceWalletIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {account.name}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenAccountDialog(account)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteAccount(account.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatCurrency(account.balance)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {accounts.length === 0 && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Accounts Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Add your first account to start tracking your finances
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenAccountDialog()}
            >
              Add Account
            </Button>
          </Paper>
        )}
      </Box>

      {/* Add/Edit Account Dialog */}
      <Dialog open={openAccountDialog} onClose={handleCloseAccountDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentAccount ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Account Name"
            fullWidth
            variant="outlined"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Balance"
            fullWidth
            variant="outlined"
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Icon</InputLabel>
            <Select
              value={accountIcon}
              onChange={(e) => setAccountIcon(e.target.value)}
              label="Icon"
            >
              {accountIcons.map((icon) => (
                <MenuItem key={icon.value} value={icon.value}>
                  {icon.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAccountDialog}>Cancel</Button>
          <Button onClick={handleSaveAccount} variant="contained">
            {currentAccount ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={openTransferDialog} onClose={handleCloseTransferDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Between Accounts</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2, mt: 1 }}>
            <InputLabel>From Account</InputLabel>
            <Select
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              label="From Account"
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name} ({formatCurrency(account.balance)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>To Account</InputLabel>
            <Select
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              label="To Account"
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Amount"
            fullWidth
            variant="outlined"
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog}>Cancel</Button>
          <Button onClick={handleTransfer} variant="contained">
            Transfer
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
      <Tooltip title="Add Account">
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenAccountDialog()}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Layout>
  );
};

export default Accounts;
