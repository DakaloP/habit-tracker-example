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
  Alert as MuiAlert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Icon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState([]);
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

  // Function to add a new task
  const addTask = () => {
    if (newTask.trim()) {
      const taskToAdd = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false
      };
      setTasks(prevTasks => [...prevTasks, taskToAdd]);
      setNewTask('');
    }
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
    
    // Ensure tasks are properly formatted before saving
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      text: task.text,
      completed: task.completed || false
    }));

    setLoading(true);
    console.log('=== Starting to save habit ===');

    try {
      // Get current user
      console.log('1. Getting current user...');
      let user = await localforage.getItem('currentUser');
      console.log('Current user from localForage:', user);
      
      // Fallback to localStorage if not found in localForage
      if (!user) {
        console.log('User not found in localForage, checking localStorage...');
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          user = JSON.parse(storedUser);
          console.log('Found user in localStorage, migrating to localForage...');
          await localforage.setItem('currentUser', user);
        } else {
          console.error('No user found, redirecting to signin');
          setLoading(false);
          navigate('/signin');
          return;
        }
      }

      // Ensure we have a valid user ID
      if (!user.id) {
        console.error('User ID not found in user object:', user);
        throw new Error('User ID not found in user object');
      }

      const habitId = Date.now().toString();
      const newHabit = {
        id: habitId,
        userId: user.id,
        name: habitName.trim(),
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
        tasks: formattedTasks,
        frequency,
        createdAt: new Date().toISOString(),
        progress: 0,
        completedDates: [],
        lastCompleted: null,
      };

      console.log('Saving new habit:', newHabit);

      // Save habit to both localForage and localStorage
      const storageKey = `habits_${user.id}`;
      console.log('Using storage key:', storageKey);
      
      // Get existing habits from localForage
      let existingHabits = [];
      try {
        let storedHabits = await localforage.getItem(storageKey);
        console.log('Existing habits from localForage:', storedHabits);
        
        // If not found in localForage, try localStorage
        if (!storedHabits) {
          console.log('No habits in localForage, checking localStorage...');
          const localStorageHabits = localStorage.getItem(storageKey);
          if (localStorageHabits) {
            storedHabits = JSON.parse(localStorageHabits);
            console.log('Found habits in localStorage, migrating to localForage...');
            await localforage.setItem(storageKey, storedHabits);
          }
        }
        
        existingHabits = Array.isArray(storedHabits) ? storedHabits : [];
        console.log('Final existing habits array:', existingHabits);
      } catch (error) {
        console.error('Error reading habits from storage:', error);
        existingHabits = [];
      }
      
      // Add new habit
      const updatedHabits = [...existingHabits, newHabit];
      console.log('Updated habits array:', updatedHabits);
      
      // Save back to both storage systems
      try {
        // Save to localForage
        await localforage.setItem(storageKey, updatedHabits);
        console.log('Habits saved to localForage');
        
        // Also save to localStorage as backup
        localStorage.setItem(storageKey, JSON.stringify(updatedHabits));
        console.log('Habits saved to localStorage');
        
        // Verify the save from both sources
        const savedHabitsForage = await localforage.getItem(storageKey);
        const savedHabitsLocal = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        console.log('Verified saved habits from localForage:', savedHabitsForage);
        console.log('Verified saved habits from localStorage:', savedHabitsLocal);
        
        setSnackbar({
          open: true,
          message: 'Habit created successfully!',
          severity: 'success',
        });

        // Reset form
        setHabitName('');
        setDescription('');
        setTasks([]);
        setNewTask('');
        
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        
      } catch (error) {
        console.error('Error saving habits:', error);
        throw new Error('Failed to save habits to storage');
      }
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
          {/* Task Input */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1, fontWeight: 'medium' }}>Add Tasks (Optional)</FormLabel>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Enter a task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTask();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={addTask}
                disabled={!newTask.trim()}
                sx={{ minWidth: 'auto' }}
              >
                <AddIcon />
              </Button>
            </Box>

            {/* Task List */}
            {tasks.length > 0 && (
              <Paper variant="outlined" sx={{ p: 1, mb: 3, maxHeight: 200, overflow: 'auto' }}>
                <List dense>
                  {tasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem>
                        <ListItemText
                          primary={task.text}
                          sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => {
                              const updatedTasks = [...tasks];
                              updatedTasks.splice(index, 1);
                              setTasks(updatedTasks);
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < tasks.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </FormControl>
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
