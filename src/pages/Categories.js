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
  Avatar,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Layout from '../components/Layout';
import { 
  getCategories, 
  saveCategories,
  generateId
} from '../utils/localStorage';

// Material UI icons for categories
const categoryIcons = [
  'restaurant', 'shopping_bag', 'directions_car', 'home', 'school',
  'local_hospital', 'sports_basketball', 'movie', 'flight_takeoff',
  'work', 'card_giftcard', 'attach_money', 'savings', 'account_balance',
  'receipt', 'payments', 'credit_card', 'local_atm', 'account_balance_wallet'
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState('expense');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Load categories
    const loadCategories = () => {
      const categoriesData = getCategories();
      setCategories(categoriesData);
    };

    loadCategories();
  }, []);

  const handleOpenCategoryDialog = (category = null) => {
    if (category) {
      setCurrentCategory(category);
      setCategoryName(category.name);
      setCategoryType(category.type);
      setCategoryIcon(category.icon || '');
      setCustomIconUrl(category.customIconUrl || '');
    } else {
      setCurrentCategory(null);
      setCategoryName('');
      setCategoryType('expense');
      setCategoryIcon('');
      setCustomIconUrl('');
    }
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a category name',
        severity: 'error'
      });
      return;
    }

    const categoryData = {
      id: currentCategory ? currentCategory.id : generateId(),
      name: categoryName,
      type: categoryType,
      icon: categoryIcon,
      customIconUrl: customIconUrl || null
    };

    let updatedCategories;
    
    if (currentCategory) {
      // Update existing category
      updatedCategories = categories.map(cat => 
        cat.id === currentCategory.id ? categoryData : cat
      );
      
      setSnackbar({
        open: true,
        message: 'Category updated successfully',
        severity: 'success'
      });
    } else {
      // Add new category
      updatedCategories = [...categories, categoryData];
      
      setSnackbar({
        open: true,
        message: 'Category added successfully',
        severity: 'success'
      });
    }
    
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    handleCloseCategoryDialog();
  };

  const handleDeleteCategory = (categoryId) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    
    setSnackbar({
      open: true,
      message: 'Category deleted successfully',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter categories based on active tab
  const filteredCategories = categories.filter(category => {
    if (activeTab === 'all') return true;
    return category.type === activeTab;
  });

  // Count categories by type
  const expenseCount = categories.filter(cat => cat.type === 'expense').length;
  const incomeCount = categories.filter(cat => cat.type === 'income').length;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Categories
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenCategoryDialog()}
          >
            Add Category
          </Button>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ mb: 4 }}>
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
              <Button 
                sx={{ 
                  py: 1.5, 
                  px: 3, 
                  borderRadius: 0,
                  borderBottom: activeTab === 'all' ? 2 : 0,
                  borderColor: 'primary.main',
                  color: activeTab === 'all' ? 'primary.main' : 'text.primary',
                  fontWeight: activeTab === 'all' ? 'medium' : 'regular'
                }}
                onClick={() => setActiveTab('all')}
              >
                All ({categories.length})
              </Button>
              <Button 
                sx={{ 
                  py: 1.5, 
                  px: 3, 
                  borderRadius: 0,
                  borderBottom: activeTab === 'expense' ? 2 : 0,
                  borderColor: 'error.main',
                  color: activeTab === 'expense' ? 'error.main' : 'text.primary',
                  fontWeight: activeTab === 'expense' ? 'medium' : 'regular'
                }}
                onClick={() => setActiveTab('expense')}
                startIcon={<ArrowDownwardIcon />}
              >
                Expense ({expenseCount})
              </Button>
              <Button 
                sx={{ 
                  py: 1.5, 
                  px: 3, 
                  borderRadius: 0,
                  borderBottom: activeTab === 'income' ? 2 : 0,
                  borderColor: 'success.main',
                  color: activeTab === 'income' ? 'success.main' : 'text.primary',
                  fontWeight: activeTab === 'income' ? 'medium' : 'regular'
                }}
                onClick={() => setActiveTab('income')}
                startIcon={<ArrowUpwardIcon />}
              >
                Income ({incomeCount})
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Categories Grid */}
        <Grid container spacing={3}>
          {filteredCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 8
                  },
                  borderLeft: 5,
                  borderColor: category.type === 'income' ? 'success.main' : 'error.main'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: category.type === 'income' ? 'success.light' : 'error.light',
                          color: 'white',
                          mr: 1.5
                        }}
                      >
                        {category.customIconUrl ? (
                          <img 
                            src={category.customIconUrl} 
                            alt={category.name} 
                            style={{ width: '24px', height: '24px' }}
                          />
                        ) : (
                          <CategoryIcon />
                        )}
                      </Avatar>
                      <Typography variant="h6">
                        {category.name}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenCategoryDialog(category)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteCategory(category.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Chip 
                    label={category.type === 'income' ? 'Income' : 'Expense'} 
                    color={category.type === 'income' ? 'success' : 'error'} 
                    size="small"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredCategories.length === 0 && (
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
              No Categories Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {categories.length === 0 
                ? "You haven't added any categories yet" 
                : `No ${activeTab} categories found`}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenCategoryDialog()}
            >
              Add Category
            </Button>
          </Paper>
        )}
      </Box>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              label="Type"
            >
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="income">Income</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Icon</InputLabel>
            <Select
              value={categoryIcon}
              onChange={(e) => setCategoryIcon(e.target.value)}
              label="Icon"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categoryIcons.map((icon) => (
                <MenuItem key={icon} value={icon}>
                  {icon}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Custom Icon URL (Optional)"
            fullWidth
            variant="outlined"
            value={customIconUrl}
            onChange={(e) => setCustomIconUrl(e.target.value)}
            helperText="Enter a URL to a PNG image for a custom icon"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            {currentCategory ? 'Update' : 'Add'}
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
      <Tooltip title="Add Category">
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenCategoryDialog()}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Layout>
  );
};

export default Categories;
