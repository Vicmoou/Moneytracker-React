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

  useEffect(() => {
    // Load user profile
    const loadProfile = () => {
      const userProfile = getUserProfile(user?.username);
      if (userProfile) {
        setProfile(userProfile);
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
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setProfile(prev => ({
          ...prev,
          photo: event.target.result
        }));
      };
      
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveProfile = () => {
    if (user) {
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
                  value={profile.email}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Username: {user?.username}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right Column - Settings */}
          <Grid item xs={12} md={8}>
            <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Appearance & Preferences
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.theme === 'dark'}
                          onChange={handleThemeChange}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {profile.theme === 'dark' ? (
                            <>
                              <DarkModeIcon sx={{ mr: 1 }} />
                              Dark Mode
                            </>
                          ) : (
                            <>
                              <LightModeIcon sx={{ mr: 1 }} />
                              Light Mode
                            </>
                          )}
                        </Box>
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
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
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
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
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Data Management
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Export your data as JSON to back it up or import previously exported data.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportData}
                  >
                    Export Data
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => setOpenImportDialog(true)}
                  >
                    Import Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Export Data Dialog */}
      <Dialog
        open={openExportDialog}
        onClose={() => setOpenExportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Copy the JSON data below or save it to a file:
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={10}
            value={exportData}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => {
              // Create a download link for the JSON data
              const blob = new Blob([exportData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'money-tracker-data.json';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            Download File
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Data Dialog */}
      <Dialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Paste your JSON data below:
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Warning: Importing data will replace all your current data. Make sure to back up your current data first.
          </Alert>
          
          <TextField
            fullWidth
            multiline
            rows={10}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            variant="outlined"
            placeholder='{"accounts": [], "transactions": [], ...}'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleImportData}
            disabled={!importData.trim()}
          >
            Import
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
    </Layout>
  );
};

export default Profile;
