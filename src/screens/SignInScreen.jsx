import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import localforage from 'localforage';
import { 
  Box, 
  TextField, 
  Typography, 
  Button, 
  InputAdornment, 
  IconButton,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const SignInScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    try {
      // Get all users from localForage
      const users = await localforage.getItem('users') || [];
      
      // Find user with matching email and password
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Save current user session
        await localforage.setItem('currentUser', user);
        navigate('/calendar');
      } else {
        // Show error message
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      alert('An error occurred during sign in. Please try again.');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.card}>
        <Box sx={styles.header}>
          <Typography variant="h4" component="h1" sx={styles.title}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={styles.subtitle}>
            Sign in to continue to Habit Tracker Pro
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSignIn} sx={styles.form}>
          <Box sx={styles.inputContainer}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={styles.input}
            />
          </Box>

          <Box sx={styles.inputContainer}>
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={styles.input}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={styles.forgotPassword}>
            <Link to="/forgot-password" style={styles.forgotPasswordLink}>
              Forgot Password?
            </Link>
          </Box>

          <Button 
            fullWidth 
            variant="contained" 
            type="submit"
            disabled={!email || !password}
            sx={styles.signInButton}
          >
            SIGN IN
          </Button>

          <Box sx={styles.dividerContainer}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" sx={styles.dividerText}>
              OR
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          <Button 
            fullWidth 
            variant="outlined"
            startIcon={<Box component="span" sx={styles.googleIcon}>G</Box>}
            sx={styles.googleButton}
          >
            Sign in with Google
          </Button>

          <Box sx={styles.signUpContainer}>
            <Typography variant="body2" sx={styles.signUpText}>
              Don't have an account?{' '}
              <Link to="/signup" style={styles.signUpLink}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    p: 2,
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    mb: 4,
  },
  title: {
    fontWeight: 'bold',
    color: '#111827',
    mb: 1,
  },
  subtitle: {
    color: '#6B7280',
    mb: 4,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    mb: 2,
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#F9FAFB',
    },
    '& .MuiInputLabel-root': {
      color: '#6B7280',
    },
  },
  forgotPassword: {
    display: 'flex',
    justifyContent: 'flex-end',
    mb: 3,
  },
  forgotPasswordLink: {
    color: '#7C3AED',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  signInButton: {
    py: 1.5,
    borderRadius: '12px',
    backgroundColor: '#7C3AED',
    textTransform: 'none',
    fontSize: '16px',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: '#6D28D9',
    },
    '&.Mui-disabled': {
      backgroundColor: '#DDD5FE',
      color: '#FFFFFF',
    },
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    my: 3,
  },
  dividerText: {
    color: '#9CA3AF',
    px: 2,
  },
  googleButton: {
    py: 1.5,
    borderRadius: '12px',
    borderColor: '#E5E7EB',
    textTransform: 'none',
    fontSize: '16px',
    fontWeight: 500,
    color: '#374151',
    mb: 3,
    '&:hover': {
      borderColor: '#D1D5DB',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
  },
  googleIcon: {
    width: '20px',
    height: '20px',
    backgroundColor: '#4285F4',
    color: '#FFFFFF',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    mr: 1,
  },
  signUpContainer: {
    textAlign: 'center',
    mt: 2,
  },
  signUpText: {
    color: '#6B7280',
  },
  signUpLink: {
    color: '#7C3AED',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
};

export default SignInScreen;
