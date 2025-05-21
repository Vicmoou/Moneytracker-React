import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Button,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { 
  getUserProfile, 
  saveUserProfile,
  getAllData,
  setAllData
} from '../utils/localStorage';

// Styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '0 auto',
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[3],
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    photo: null,
    theme: 'light',
    currency: 'USD',
    language: 'en'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load user profile
    const loadProfile = () => {
      try {
        const userProfile = getUserProfile(user?.username);
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setSnackbar({
          open: true,
          message: 'Error loading profile',
          severity: 'error'
        });
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    setProfile(prev => ({
      ...prev,
      theme: newTheme
    }));
    
    // Apply theme change immediately
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size should be less than 5MB',
          severity: 'error'
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: 'Please upload an image file',
          severity: 'error'
        });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        setProfile(prev => ({
          ...prev,
          photo: event.target.result
        }));
      };
      
      reader.onerror = () => {
        setSnackbar({
          open: true,
          message: 'Error reading image file',
          severity: 'error'
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Save profile to localStorage
      saveUserProfile(user.username, profile);
      
      // Update user context with new profile data
      updateUser({
        ...user,
        profile
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setSnackbar({
        open: true,
        message: 'Error saving profile',
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const allData = getAllData();
    const jsonData = JSON.stringify(allData, null, 2);
    setExportData(jsonData);
    setOpenExportDialog(true);
  };

  const handleImportData = () => {
    try {
      const parsedData = JSON.parse(importData);
      setAllData(parsedData);
      
      setSnackbar({
        open: true,
        message: 'Data imported successfully',
        severity: 'success'
      });
      
      setOpenImportDialog(false);
      
      // Reload the page to reflect the imported data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Invalid JSON data',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'AOA', label: 'Kwanza (Kz)' },
    { value: 'BRL', label: 'Reais (R$)' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' }
  ];

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Profile
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column - Personal Info */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <ProfileAvatar 
                    src={profile.photo} 
                    alt={profile.name || user?.username}
                  >
                    {!profile.photo && (profile.name?.[0] || user?.username?.[0] || 'U')}
                  </ProfileAvatar>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<PhotoCameraIcon />}
                      size="small"
                    >
                      Change Photo
                      <VisuallyHiddenInput 
                        type="file" 
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </Button>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Currency</InputLabel>
                  <Select
                    name="currency"
                    value={profile.currency}
                    onChange={handleInputChange}
                    label="Currency"
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Language</InputLabel>
                  <Select
                    name="language"
                    value={profile.language}
                    onChange={handleInputChange}
                    label="Language"
                  >
                    {languages.map((language) => (
                      <MenuItem key={language.value} value={language.value}>
                        {language.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.theme === 'dark'}
                      onChange={handleThemeChange}
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right Column - Data Management */}
          <Grid item xs={12} md={8}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Data Management
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportData}
                    fullWidth
                  >
                    Export Data
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => setOpenImportDialog(true)}
                    fullWidth
                  >
                    Import Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Export Dialog */}
      <Dialog
        open={openExportDialog}
        onClose={() => setOpenExportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={exportData}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              navigator.clipboard.writeText(exportData);
              setSnackbar({
                open: true,
                message: 'Data copied to clipboard',
                severity: 'success'
              });
            }}
          >
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder="Paste your JSON data here"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleImportData}
            disabled={!importData.trim()}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Profile;
