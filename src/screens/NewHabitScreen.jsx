import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localforage from 'localforage';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Custom styled components
const ColorCircle = styled('div')(({ color, selected }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: selected ? '3px solid #7C3AED' : 'none',
  '&:hover': {
    transform: 'scale(1.1)',
    transition: 'transform 0.2s',
  },
}));

const IconButtonStyled = styled(Button)(({ selected }) => ({
  minWidth: 'auto',
  width: 50,
  height: 50,
  fontSize: '24px',
  borderRadius: '12px',
  margin: '8px',
  padding: 0,
  border: selected ? '2px solid #7C3AED' : '1px solid #E5E7EB',
  '&:hover': {
    transform: 'scale(1.05)',
    transition: 'transform 0.2s',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  borderRadius: '16px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}));

const NewHabitScreen = () => {
  const navigate = useNavigate();
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏃');
  const [selectedColor, setSelectedColor] = useState('#7C3AED');
  const [frequency, setFrequency] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const icons = ['🏃', '📚', '💧', '🏋️', '🧘', '🎯', '✏️', '📱'];
  const colors = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSaveHabit = async () => {
    if (!habitName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a habit name',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const user = await localforage.getItem('currentUser');
      if (!user) {
        navigate('/signin');
        return;
      }

      const habitId = Date.now().toString();
      const newHabit = {
        id: habitId,
        userId: user.id,
        name: habitName,
        description,
        icon: selectedIcon,
        color: selectedColor,
        frequency,
        createdAt: new Date().toISOString(),
        progress: 0,
        completedDates: [],
      };

      // Save habit to localForage
      const existingHabits = (await localforage.getItem(`habits_${user.id}`)) || [];
      await localforage.setItem(
        `habits_${user.id}`,
        [...existingHabits, newHabit]
      );

      setSnackbar({
        open: true,
        message: 'Habit created successfully!',
        severity: 'success',
      });

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error saving habit:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save habit. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          New Habit
        </Typography>
      </Box>

      <StyledPaper elevation={0}>
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Habit Name"
            variant="outlined"
            placeholder="e.g., Drink water"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Description (Optional)"
            variant="outlined"
            placeholder="Add a short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 4 }}
          />

          <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'medium' }}>Icon</FormLabel>
            <Grid container spacing={1} justifyContent="center">
              {icons.map((icon, index) => (
                <Grid key={index}>
                  <IconButtonStyled
                    variant={selectedIcon === icon ? 'contained' : 'outlined'}
                    onClick={() => setSelectedIcon(icon)}
                    selected={selectedIcon === icon}
                  >
                    {icon}
                  </IconButtonStyled>
                </Grid>
              ))}
            </Grid>
          </FormControl>

          <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'medium' }}>Color</FormLabel>
            <Grid container spacing={2} justifyContent="center">
              {colors.map((color, index) => (
                <Grid key={index}>
                  <ColorCircle
                    color={color}
                    selected={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                  />
                </Grid>
              ))}
            </Grid>
          </FormControl>

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'medium' }}>Frequency</FormLabel>
            <RadioGroup
              row
              aria-label="frequency"
              name="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              sx={{ justifyContent: 'space-between' }}
            >
              {['daily', 'weekly', 'monthly'].map((freq) => (
                <FormControlLabel
                  key={freq}
                  value={freq}
                  control={<Radio />}
                  label={freq.charAt(0).toUpperCase() + freq.slice(1)}
                  sx={{
                    flex: 1,
                    m: 0,
                    border: frequency === freq ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    mx: 1,
                    px: 2,
                    py: 1,
                    '& .MuiFormControlLabel-label': {
                      textAlign: 'center',
                      width: '100%',
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSaveHabit}
          disabled={loading || !habitName.trim()}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            mt: 2,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Habit'}
        </Button>
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

export default NewHabitScreen;
