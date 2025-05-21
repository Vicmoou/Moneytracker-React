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
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  SwipeableDrawer,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import InfoIcon from '@mui/icons-material/Info';
import Layout from '../components/Layout';
import { 
  getBudgets, 
  saveBudgets,
  getCategories,
  getTransactions,
  formatCurrency,
  generateId,
  getCategoryById
} from '../utils/localStorage';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Styled components for swipeable items
const SwipeableItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: 'transform 0.2s ease-out',
  '&:hover': {
    boxShadow: theme.shadows[3],
  }
}));

const ItemContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'transform 0.3s ease-out',
}));

const LeftActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  top: 0,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const RightActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: 'inherit',
  margin: theme.spacing(0, 0.5),
}));

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCategoryId, setBudgetCategoryId] = useState('');
  const [budgetStartDate, setBudgetStartDate] = useState(new Date());
  const [budgetEndDate, setBudgetEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState('all');
  const [activeSwipeItem, setActiveSwipeItem] = useState(null);
  const itemRefs = React.useRef({});
  const touchStartX = React.useRef(null);
  const touchEndX = React.useRef(null);
  const swipeThreshold = 100; // Minimum swipe distance to trigger action

  useEffect(() => {
    // Load data
    const loadData = () => {
      const budgetsData = getBudgets();
      const categoriesData = getCategories();
      const transactionsData = getTransactions();
      
      setBudgets(budgetsData);
      setFilteredBudgets(budgetsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
    };

    loadData();
  }, []);

  useEffect(() => {
    // Filter budgets based on active tab
    let filtered = [...budgets];
    
    if (activeTab === 'active') {
      const now = new Date();
      filtered = filtered.filter(budget => 
        new Date(budget.startDate) <= now && new Date(budget.endDate) >= now
      );
    } else if (activeTab === 'upcoming') {
      const now = new Date();
      filtered = filtered.filter(budget => new Date(budget.startDate) > now);
    } else if (activeTab === 'expired') {
      const now = new Date();
      filtered = filtered.filter(budget => new Date(budget.endDate) < now);
    }
    
    setFilteredBudgets(filtered);
  }, [budgets, activeTab]);

  const handleOpenBudgetDialog = (budget = null) => {
    if (budget) {
      setCurrentBudget(budget);
      setBudgetName(budget.name);
      setBudgetAmount(budget.amount.toString());
      setBudgetCategoryId(budget.categoryId);
      setBudgetStartDate(new Date(budget.startDate));
      setBudgetEndDate(new Date(budget.endDate));
    } else {
      setCurrentBudget(null);
      setBudgetName('');
      setBudgetAmount('');
      setBudgetCategoryId('');
      setBudgetStartDate(new Date());
      setBudgetEndDate(new Date(new Date().setMonth(new Date().getMonth() + 1)));
    }
    setOpenBudgetDialog(true);
  };

  const handleCloseBudgetDialog = () => {
    setOpenBudgetDialog(false);
  };

  const handleOpenDetailsDialog = (budget) => {
    setCurrentBudget(budget);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  const handleSaveBudget = () => {
    if (!budgetName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a budget name',
        severity: 'error'
      });
      return;
    }

    const parsedAmount = parseFloat(budgetAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid amount',
        severity: 'error'
      });
      return;
    }

    if (!budgetCategoryId) {
      setSnackbar({
        open: true,
        message: 'Please select a category',
        severity: 'error'
      });
      return;
    }

    if (budgetStartDate >= budgetEndDate) {
      setSnackbar({
        open: true,
        message: 'End date must be after start date',
        severity: 'error'
      });
      return;
    }

    const budgetData = {
      id: currentBudget ? currentBudget.id : generateId(),
      name: budgetName,
      amount: parsedAmount,
      categoryId: budgetCategoryId,
      startDate: budgetStartDate.toISOString(),
      endDate: budgetEndDate.toISOString(),
      createdAt: currentBudget ? currentBudget.createdAt : new Date().toISOString()
    };

    let updatedBudgets;
    
    if (currentBudget) {
      // Update existing budget
      updatedBudgets = budgets.map(b => 
        b.id === currentBudget.id ? budgetData : b
      );
      
      setSnackbar({
        open: true,
        message: 'Budget updated successfully',
        severity: 'success'
      });
    } else {
      // Add new budget
      updatedBudgets = [...budgets, budgetData];
      
      setSnackbar({
        open: true,
        message: 'Budget added successfully',
        severity: 'success'
      });
    }
    
    setBudgets(updatedBudgets);
    saveBudgets(updatedBudgets);
    handleCloseBudgetDialog();
  };

  const handleDeleteBudget = (budgetId) => {
    const updatedBudgets = budgets.filter(b => b.id !== budgetId);
    setBudgets(updatedBudgets);
    saveBudgets(updatedBudgets);
    
    setSnackbar({
      open: true,
      message: 'Budget deleted successfully',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate budget progress
  const calculateBudgetProgress = (budget) => {
    const relevantTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const budgetStartDate = new Date(budget.startDate);
      const budgetEndDate = new Date(budget.endDate);
      
      return (
        t.categoryId === budget.categoryId &&
        t.type === 'expense' &&
        transactionDate >= budgetStartDate &&
        transactionDate <= budgetEndDate
      );
    });
    
    const spent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.amount) * 100;
    
    return {
      spent,
      remaining: Math.max(budget.amount - spent, 0),
      percentage: Math.min(percentage, 100),
      isOverBudget: percentage > 100
    };
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e, budgetId) => {
    touchStartX.current = e.touches[0].clientX;
    setActiveSwipeItem(budgetId);
  };

  const handleTouchMove = (e, budgetId) => {
    if (!activeSwipeItem || activeSwipeItem !== budgetId) return;
    
    touchEndX.current = e.touches[0].clientX;
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    const itemElement = itemRefs.current[budgetId];
    if (itemElement) {
      // Limit the swipe distance
      const maxSwipe = 150;
      const limitedSwipe = Math.max(Math.min(swipeDistance, maxSwipe), -maxSwipe);
      
      itemElement.style.transform = `translateX(${limitedSwipe}px)`;
    }
  };

  const handleTouchEnd = (e, budgetId) => {
    if (!activeSwipeItem || activeSwipeItem !== budgetId) return;
    
    const swipeDistance = touchEndX.current - touchStartX.current;
    const itemElement = itemRefs.current[budgetId];
    
    if (Math.abs(swipeDistance) >= swipeThreshold) {
      // Swipe action triggered
      if (swipeDistance > 0) {
        // Swipe right - show details
        itemElement.style.transform = 'translateX(150px)';
      } else {
        // Swipe left - show edit/delete
        itemElement.style.transform = 'translateX(-150px)';
      }
    } else {
      // Reset position
      itemElement.style.transform = 'translateX(0)';
    }
    
    setActiveSwipeItem(null);
  };

  // Reset swipe position
  const resetSwipe = (budgetId) => {
    const itemElement = itemRefs.current[budgetId];
    if (itemElement) {
      itemElement.style.transform = 'translateX(0)';
    }
  };

  // Check if a budget is active, upcoming, or expired
  const getBudgetStatus = (budget) => {
    const now = new Date();
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    
    if (now < startDate) {
      return 'upcoming';
    } else if (now > endDate) {
      return 'expired';
    } else {
      return 'active';
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Budgets
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenBudgetDialog()}
          >
            Add Budget
          </Button>
        </Box>

        {/* Budget Tabs */}
        <Box sx={{ mb: 4 }}>
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="All Budgets" value="all" />
              <Tab label="Active" value="active" />
              <Tab label="Upcoming" value="upcoming" />
              <Tab label="Expired" value="expired" />
            </Tabs>
          </Paper>
        </Box>

        {/* Budgets List */}
        {filteredBudgets.length > 0 ? (
          <Box>
            {filteredBudgets.map((budget) => {
              const progress = calculateBudgetProgress(budget);
              const category = getCategoryById(budget.categoryId);
              const status = getBudgetStatus(budget);
              
              return (
                <SwipeableItem key={budget.id}>
                  {/* Left Actions (shown when swiped right) */}
                  <RightActions>
                    <ActionButton 
                      onClick={() => {
                        handleOpenDetailsDialog(budget);
                        resetSwipe(budget.id);
                      }}
                    >
                      <InfoIcon />
                    </ActionButton>
                  </RightActions>
                  
                  {/* Budget Content */}
                  <ItemContent
                    ref={el => itemRefs.current[budget.id] = el}
                    onTouchStart={(e) => handleTouchStart(e, budget.id)}
                    onTouchMove={(e) => handleTouchMove(e, budget.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, budget.id)}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {budget.name}
                          </Typography>
                          <Chip 
                            label={status} 
                            size="small" 
                            color={
                              status === 'active' ? 'success' : 
                              status === 'upcoming' ? 'primary' : 'default'
                            }
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(progress.spent)} / {formatCurrency(budget.amount)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {category && (
                          <Chip 
                            label={category.name} 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress.percentage}
                            color={progress.isOverBudget ? 'error' : 'primary'}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: 'rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </Box>
                        <Typography 
                          variant="body2" 
                          color={progress.isOverBudget ? 'error.main' : 'text.secondary'}
                          sx={{ fontWeight: 'medium' }}
                        >
                          {progress.percentage.toFixed(0)}%
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Remaining: {formatCurrency(progress.remaining)}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <ArrowBackIosNewIcon fontSize="small" color="action" />
                          <ArrowForwardIosIcon fontSize="small" color="action" />
                        </Box>
                      </Box>
                    </Box>
                  </ItemContent>
                  
                  {/* Right Actions (shown when swiped left) */}
                  <LeftActions>
                    <ActionButton 
                      onClick={() => {
                        handleOpenBudgetDialog(budget);
                        resetSwipe(budget.id);
                      }}
                    >
                      <EditIcon />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => {
                        handleDeleteBudget(budget.id);
                        resetSwipe(budget.id);
                      }}
                    >
                      <DeleteIcon />
                    </ActionButton>
                  </LeftActions>
                </SwipeableItem>
              );
            })}
          </Box>
        ) : (
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
              No Budgets Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {budgets.length === 0 
                ? "You haven't created any budgets yet" 
                : `No ${activeTab} budgets found`}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenBudgetDialog()}
            >
              Add Budget
            </Button>
          </Paper>
        )}
      </Box>

      {/* Add/Edit Budget Dialog */}
      <Dialog open={openBudgetDialog} onClose={handleCloseBudgetDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentBudget ? 'Edit Budget' : 'Add New Budget'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Budget Name"
            fullWidth
            variant="outlined"
            value={budgetName}
            onChange={(e) => setBudgetName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            margin="dense"
            label="Budget Amount"
            fullWidth
            variant="outlined"
            type="number"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={budgetCategoryId}
              onChange={(e) => setBudgetCategoryId(e.target.value)}
              label="Category"
            >
              {categories
                .filter(category => category.type === 'expense')
                .map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DatePicker
                label="Start Date"
                value={budgetStartDate}
                onChange={(newDate) => setBudgetStartDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="End Date"
                value={budgetEndDate}
                onChange={(newDate) => setBudgetEndDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBudgetDialog}>Cancel</Button>
          <Button onClick={handleSaveBudget} variant="contained">
            {currentBudget ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Budget Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Budget Details
        </DialogTitle>
        <DialogContent>
          {currentBudget && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {currentBudget.name}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Budget Amount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {formatCurrency(currentBudget.amount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {getCategoryById(currentBudget.categoryId)?.name || 'Unknown Category'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentBudget.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentBudget.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                {(() => {
                  const progress = calculateBudgetProgress(currentBudget);
                  return (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Spent So Far
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {formatCurrency(progress.spent)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Remaining
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 'medium',
                            color: progress.isOverBudget ? 'error.main' : 'success.main'
                          }}
                        >
                          {formatCurrency(progress.remaining)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ mt: 1, mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Progress</Typography>
                            <Typography 
                              variant="body2"
                              color={progress.isOverBudget ? 'error.main' : 'text.secondary'}
                            >
                              {progress.percentage.toFixed(0)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress.percentage}
                            color={progress.isOverBudget ? 'error' : 'primary'}
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              backgroundColor: 'rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </Box>
                      </Grid>
                    </>
                  );
                })()}
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={getBudgetStatus(currentBudget)} 
                    color={
                      getBudgetStatus(currentBudget) === 'active' ? 'success' : 
                      getBudgetStatus(currentBudget) === 'upcoming' ? 'primary' : 'default'
                    }
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Close</Button>
          <Button 
            onClick={() => {
              handleCloseDetailsDialog();
              handleOpenBudgetDialog(currentBudget);
            }} 
            color="primary"
          >
            Edit
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
      <Tooltip title="Add Budget">
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenBudgetDialog()}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Layout>
  );
};

export default Budget;
