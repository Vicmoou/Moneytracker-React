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
  Chip,
  SwipeableDrawer,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Layout from '../components/Layout';
import { 
  getShoppingList, 
  saveShoppingList,
  getAccounts,
  getCategories,
  formatCurrency,
  generateId,
  getAccountById,
  getCategoryById,
  getTransactions,
  saveTransactions
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

const ShoppingList = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openConvertDialog, setOpenConvertDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemDate, setItemDate] = useState(null);
  const [itemAccountId, setItemAccountId] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [itemPriority, setItemPriority] = useState('medium');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sortBy, setSortBy] = useState('date-asc');
  const [activeSwipeItem, setActiveSwipeItem] = useState(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const swipeThreshold = 100; // Minimum swipe distance to trigger action
  const itemRefs = useRef({});

  useEffect(() => {
    // Load data
    const loadData = () => {
      const shoppingListData = getShoppingList();
      const accountsData = getAccounts();
      const categoriesData = getCategories();
      
      setShoppingList(shoppingListData);
      setFilteredItems(shoppingListData);
      setAccounts(accountsData);
      setCategories(categoriesData);
    };

    loadData();
  }, []);

  useEffect(() => {
    // Apply sorting
    let sorted = [...shoppingList];
    
    switch (sortBy) {
      case 'date-asc':
        sorted.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date) - new Date(b.date);
        });
        break;
      case 'date-desc':
        sorted.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date) - new Date(a.date);
        });
        break;
      case 'amount-asc':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      case 'amount-desc':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'priority-high':
        sorted.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        break;
      default:
        // Default to date ascending
        sorted.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date) - new Date(b.date);
        });
    }
    
    setFilteredItems(sorted);
  }, [shoppingList, sortBy]);

  const handleOpenItemDialog = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setItemName(item.name);
      setItemAmount(item.amount.toString());
      setItemDate(item.date ? new Date(item.date) : null);
      setItemAccountId(item.accountId || (accounts.length > 0 ? accounts[0].id : ''));
      setItemCategoryId(item.categoryId || '');
      setItemNotes(item.notes || '');
      setItemPriority(item.priority || 'medium');
    } else {
      setCurrentItem(null);
      setItemName('');
      setItemAmount('');
      setItemDate(null);
      setItemAccountId(accounts.length > 0 ? accounts[0].id : '');
      setItemCategoryId('');
      setItemNotes('');
      setItemPriority('medium');
    }
    setOpenItemDialog(true);
  };

  const handleCloseItemDialog = () => {
    setOpenItemDialog(false);
  };

  const handleOpenConvertDialog = (item) => {
    setCurrentItem(item);
    setOpenConvertDialog(true);
  };

  const handleCloseConvertDialog = () => {
    setOpenConvertDialog(false);
  };

  const handleOpenDetailsDialog = (item) => {
    setCurrentItem(item);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  const handleSaveItem = () => {
    if (!itemName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter an item name',
        severity: 'error'
      });
      return;
    }

    const parsedAmount = parseFloat(itemAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid amount',
        severity: 'error'
      });
      return;
    }

    const itemData = {
      id: currentItem ? currentItem.id : generateId(),
      name: itemName,
      amount: parsedAmount,
      date: itemDate ? itemDate.toISOString() : null,
      accountId: itemAccountId,
      categoryId: itemCategoryId,
      notes: itemNotes,
      priority: itemPriority,
      createdAt: currentItem ? currentItem.createdAt : new Date().toISOString()
    };

    let updatedItems;
    
    if (currentItem) {
      // Update existing item
      updatedItems = shoppingList.map(item => 
        item.id === currentItem.id ? itemData : item
      );
      
      setSnackbar({
        open: true,
        message: 'Item updated successfully',
        severity: 'success'
      });
    } else {
      // Add new item
      updatedItems = [...shoppingList, itemData];
      
      setSnackbar({
        open: true,
        message: 'Item added successfully',
        severity: 'success'
      });
    }
    
    setShoppingList(updatedItems);
    saveShoppingList(updatedItems);
    handleCloseItemDialog();
  };

  const handleDeleteItem = (itemId) => {
    const updatedItems = shoppingList.filter(item => item.id !== itemId);
    setShoppingList(updatedItems);
    saveShoppingList(updatedItems);
    
    setSnackbar({
      open: true,
      message: 'Item deleted successfully',
      severity: 'success'
    });
  };

  const handleConvertToTransaction = () => {
    if (!currentItem) return;
    
    // Create a new transaction from the shopping list item
    const newTransaction = {
      id: generateId(),
      type: 'expense',
      description: currentItem.name,
      amount: currentItem.amount,
      date: new Date().toISOString(),
      accountId: currentItem.accountId,
      categoryId: currentItem.categoryId,
      notes: currentItem.notes,
      includeInReports: true
    };
    
    // Add transaction
    const transactions = getTransactions();
    const updatedTransactions = [...transactions, newTransaction];
    saveTransactions(updatedTransactions);
    
    // Update account balance
    const updatedAccounts = [...accounts];
    const account = updatedAccounts.find(acc => acc.id === currentItem.accountId);
    if (account) {
      account.balance -= currentItem.amount;
    }
    
    // Remove from shopping list
    const updatedItems = shoppingList.filter(item => item.id !== currentItem.id);
    setShoppingList(updatedItems);
    saveShoppingList(updatedItems);
    
    setSnackbar({
      open: true,
      message: 'Item converted to transaction successfully',
      severity: 'success'
    });
    
    handleCloseConvertDialog();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e, itemId) => {
    touchStartX.current = e.touches[0].clientX;
    setActiveSwipeItem(itemId);
  };

  const handleTouchMove = (e, itemId) => {
    if (!activeSwipeItem || activeSwipeItem !== itemId) return;
    
    touchEndX.current = e.touches[0].clientX;
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    const itemElement = itemRefs.current[itemId];
    if (itemElement) {
      // Limit the swipe distance
      const maxSwipe = 150;
      const limitedSwipe = Math.max(Math.min(swipeDistance, maxSwipe), -maxSwipe);
      
      itemElement.style.transform = `translateX(${limitedSwipe}px)`;
    }
  };

  const handleTouchEnd = (e, itemId) => {
    if (!activeSwipeItem || activeSwipeItem !== itemId) return;
    
    const swipeDistance = touchEndX.current - touchStartX.current;
    const itemElement = itemRefs.current[itemId];
    
    if (Math.abs(swipeDistance) >= swipeThreshold) {
      // Swipe action triggered
      if (swipeDistance > 0) {
        // Swipe right - show details/convert
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
  const resetSwipe = (itemId) => {
    const itemElement = itemRefs.current[itemId];
    if (itemElement) {
      itemElement.style.transform = 'translateX(0)';
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Shopping List
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenItemDialog()}
          >
            Add Item
          </Button>
        </Box>

        {/* Sort Options */}
        <Box sx={{ display: 'flex', mb: 3 }}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort by"
            >
              <MenuItem value="date-asc">Date (Earliest First)</MenuItem>
              <MenuItem value="date-desc">Date (Latest First)</MenuItem>
              <MenuItem value="amount-desc">Amount (Highest First)</MenuItem>
              <MenuItem value="amount-asc">Amount (Lowest First)</MenuItem>
              <MenuItem value="name-asc">Name (A-Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z-A)</MenuItem>
              <MenuItem value="priority-high">Priority (High First)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Shopping List */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Planned Transactions
        </Typography>

        {filteredItems.length > 0 ? (
          <Box>
            {filteredItems.map((item) => {
              const account = getAccountById(item.accountId);
              const category = getCategoryById(item.categoryId);
              
              return (
                <SwipeableItem key={item.id}>
                  {/* Left Actions (shown when swiped right) */}
                  <RightActions>
                    <ActionButton 
                      onClick={() => {
                        handleOpenDetailsDialog(item);
                        resetSwipe(item.id);
                      }}
                    >
                      <InfoIcon />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => {
                        handleOpenConvertDialog(item);
                        resetSwipe(item.id);
                      }}
                    >
                      <CheckCircleIcon />
                    </ActionButton>
                  </RightActions>
                  
                  {/* Item Content */}
                  <ItemContent
                    ref={el => itemRefs.current[item.id] = el}
                    onTouchStart={(e) => handleTouchStart(e, item.id)}
                    onTouchMove={(e) => handleTouchMove(e, item.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, item.id)}
                    sx={{
                      borderLeft: 6,
                      borderColor: 
                        item.priority === 'high' ? 'error.main' : 
                        item.priority === 'medium' ? 'warning.main' : 'primary.main'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          ml: 1
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {item.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          {item.date && (
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                              {new Date(item.date).toLocaleDateString()}
                            </Typography>
                          )}
                          {account && (
                            <Chip 
                              label={account.name} 
                              size="small" 
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                          )}
                          {category && (
                            <Chip 
                              label={category.name} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>
                        {formatCurrency(item.amount)}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ArrowBackIosNewIcon fontSize="small" color="action" />
                        <SwapHorizIcon color="action" />
                        <ArrowForwardIosIcon fontSize="small" color="action" />
                      </Box>
                    </Box>
                  </ItemContent>
                  
                  {/* Right Actions (shown when swiped left) */}
                  <LeftActions>
                    <ActionButton 
                      onClick={() => {
                        handleOpenItemDialog(item);
                        resetSwipe(item.id);
                      }}
                    >
                      <EditIcon />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => {
                        handleDeleteItem(item.id);
                        resetSwipe(item.id);
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
              No Items Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Add items to your shopping list to plan future transactions
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenItemDialog()}
            >
              Add Item
            </Button>
          </Paper>
        )}
      </Box>

      {/* Add/Edit Item Dialog */}
      <Dialog open={openItemDialog} onClose={handleCloseItemDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Item Name"
            fullWidth
            variant="outlined"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            margin="dense"
            label="Amount"
            fullWidth
            variant="outlined"
            type="number"
            value={itemAmount}
            onChange={(e) => setItemAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Due Date (Optional)"
              value={itemDate}
              onChange={(newDate) => setItemDate(newDate)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />
          </LocalizationProvider>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Account</InputLabel>
            <Select
              value={itemAccountId}
              onChange={(e) => setItemAccountId(e.target.value)}
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
              value={itemCategoryId}
              onChange={(e) => setItemCategoryId(e.target.value)}
              label="Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
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
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={itemPriority}
              onChange={(e) => setItemPriority(e.target.value)}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Notes (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={itemNotes}
            onChange={(e) => setItemNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemDialog}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained">
            {currentItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Convert to Transaction Dialog */}
      <Dialog open={openConvertDialog} onClose={handleCloseConvertDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          Convert to Transaction
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you ready to convert this planned item to an actual transaction?
          </Typography>
          
          {currentItem && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {currentItem.name}
              </Typography>
              <Typography variant="body1">
                Amount: {formatCurrency(currentItem.amount)}
              </Typography>
              {getAccountById(currentItem.accountId) && (
                <Typography variant="body2">
                  Account: {getAccountById(currentItem.accountId).name}
                </Typography>
              )}
              {getCategoryById(currentItem.categoryId) && (
                <Typography variant="body2">
                  Category: {getCategoryById(currentItem.categoryId).name}
                </Typography>
              )}
            </Box>
          )}
          
          <Alert severity="info">
            This will create a new expense transaction and remove the item from your shopping list.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConvertDialog}>Cancel</Button>
          <Button onClick={handleConvertToTransaction} variant="contained" color="primary">
            Convert
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Item Details
        </DialogTitle>
        <DialogContent>
          {currentItem && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {currentItem.name}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {formatCurrency(currentItem.amount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip 
                    label={currentItem.priority || 'Medium'} 
                    color={
                      currentItem.priority === 'high' ? 'error' : 
                      currentItem.priority === 'medium' ? 'warning' : 'primary'
                    }
                    size="small"
                  />
                </Grid>
                
                {currentItem.date && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(currentItem.date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentItem.createdAt || new Date()).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                {getAccountById(currentItem.accountId) && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Account
                    </Typography>
                    <Typography variant="body1">
                      {getAccountById(currentItem.accountId).name}
                    </Typography>
                  </Grid>
                )}
                
                {getCategoryById(currentItem.categoryId) && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1">
                      {getCategoryById(currentItem.categoryId).name}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              
              {currentItem.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {currentItem.notes}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Close</Button>
          <Button 
            onClick={() => {
              handleCloseDetailsDialog();
              handleOpenItemDialog(currentItem);
            }} 
            color="primary"
          >
            Edit
          </Button>
          <Button 
            onClick={() => {
              handleCloseDetailsDialog();
              handleOpenConvertDialog(currentItem);
            }} 
            variant="contained" 
            color="primary"
          >
            Convert to Transaction
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
      <Tooltip title="Add Item">
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenItemDialog()}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Layout>
  );
};

export default ShoppingList;
