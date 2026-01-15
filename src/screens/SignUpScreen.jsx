import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import localforage from 'localforage';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert as MuiAlert,
  Snackbar,
  useTheme,
  styled
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const SocialButton = styled(Button)(({ theme }) => ({
  padding: '10px',
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const SignUpScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.email || !formData.phoneNumber || !formData.password) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error',
      });
      return;
    }

    if (formData.password.length < 6) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 6 characters',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      // Check if user already exists
      const existingUsers = (await localforage.getItem('users')) || [];
      
      const userExists = existingUsers.some(user => user.email === formData.email);
      if (userExists) {
        setSnackbar({
          open: true,
          message: 'An account with this email already exists',
          severity: 'error',
        });
        return;
      }

      // Create new user with all required fields
      const newUser = {
        id: Date.now().toString(),
        email: formData.email,
        password: formData.password, // In a real app, never store plain passwords
        name: formData.firstName,
        phoneNumber: formData.phoneNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save user to both storage systems
      const updatedUsers = [...existingUsers, newUser];
      
      try {
        // Save to localForage
        await localforage.setItem('users', updatedUsers);
        await localforage.setItem('currentUser', newUser);
        
        // Also save to localStorage as backup
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        console.log('User registered successfully:', newUser);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Account created successfully!',
          severity: 'success',
        });
        
        // Verify the user was saved correctly
        const savedUser = await localforage.getItem('currentUser');
        console.log('Verified saved user:', savedUser);
        
        // Redirect to sign-in page with success message
        setTimeout(() => {
          navigate('/signin', { 
            state: { 
              email: formData.email,
              showSuccessMessage: 'Registration successful! Please sign in.'
            } 
          });
        }, 1000);
        
      } catch (storageError) {
        console.error('Error saving user data:', storageError);
        throw new Error('Failed to save user data');
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred during sign up. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Let's get started. Create an account to continue.
        </Typography>
      </Box>

      <StyledPaper elevation={0}>
        <Box component="form" onSubmit={handleSignUp} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="First Name"
            margin="normal"
            variant="outlined"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            margin="normal"
            variant="outlined"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email"
            margin="normal"
            variant="outlined"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            margin="normal"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            helperText="Must be at least 6 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            or sign up with
          </Typography>
        </Divider>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <SocialButton fullWidth>
            <Box component="span" sx={{ mr: 1 }}>G</Box>
            Google
          </SocialButton>
          <SocialButton fullWidth>
            <Box component="span" sx={{ mr: 1 }}>f</Box>
            Facebook
          </SocialButton>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link 
              to="/signin" 
              style={{ 
                color: theme.palette.primary.main, 
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </StyledPaper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default SignUpScreen;
