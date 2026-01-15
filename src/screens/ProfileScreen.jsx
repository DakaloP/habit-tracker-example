import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Avatar, 
  Container, 
  Paper, 
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import localforage from 'localforage';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get user from localForage first
        let userData = await localforage.getItem('currentUser');
        
        // If not found, try localStorage
        if (!userData) {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            userData = JSON.parse(storedUser);
            // Save to localForage for future use
            await localforage.setItem('currentUser', userData);
          }
        }

        if (userData) {
          setUser(userData);
        } else {
          // If no user is found, redirect to sign in
          navigate('/signin');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleEditProfile = () => {
    // Add edit profile functionality here
    console.log('Edit profile clicked');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>No user data found. Please sign in.</Typography>
      </Box>
    );
  }

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          My Profile
        </Typography>
      </Box>

      <StyledPaper elevation={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              fontSize: '2.5rem',
              bgcolor: 'primary.main',
              mb: 2,
            }}
          >
            {getInitials(user.name || user.email)}
          </Avatar>
          
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {user.name || 'User'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Member since {formatDate(user.createdAt)}
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={handleEditProfile}
            sx={{ borderRadius: '12px' }}
          >
            Edit Profile
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <List>
          <ListItem>
            <ListItemIcon>
              <PersonIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Name" 
              secondary={user.name || 'Not set'} 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <EmailIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Email" 
              secondary={user.email || 'Not set'} 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <PhoneIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Phone" 
              secondary={user.phoneNumber || 'Not set'} 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CalendarIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Member Since" 
              secondary={formatDate(user.createdAt)} 
            />
          </ListItem>
        </List>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              // Handle sign out
              localforage.removeItem('currentUser');
              localStorage.removeItem('currentUser');
              navigate('/signin');
            }}
            sx={{ borderRadius: '12px', px: 4 }}
          >
            Sign Out
          </Button>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default ProfileScreen;
