import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import localforage from 'localforage';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  IconButton,
  useTheme,
  Container,
  Paper,
  Grid,
  styled,
  AppBar,
  Toolbar,
  CircularProgress,
  Checkbox,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { format, addDays, isToday, isSameDay, parseISO } from 'date-fns';

// Custom styled components
const DayButton = styled(Button)(({ selected, theme }) => ({
  minWidth: 40,
  height: 60,
  borderRadius: 12,
  margin: '0 4px',
  padding: '8px 4px',
  flexDirection: 'column',
  textTransform: 'none',
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
  },
}));

const HabitCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px 0 rgba(0,0,0,0.1)',
  },
}));

const DashboardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Get the selected date from location state or use current date
    if (location.state?.selectedDate) {
      return new Date(location.state.selectedDate);
    }
    return new Date();
  });

  // Generate 7 days starting from today
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Debug function to log storage status
  const debugStorage = async () => {
    try {
      // Test localForage
      await localforage.setItem('__test_localforage', { test: 'localforage works', timestamp: new Date().toISOString() });
      const localForageTest = await localforage.getItem('__test_localforage');
      console.log('localForage test:', localForageTest);
      
      // Test localStorage
      localStorage.setItem('__test_localStorage', JSON.stringify({ test: 'localStorage works', timestamp: new Date().toISOString() }));
      const localStorageTest = JSON.parse(localStorage.getItem('__test_localStorage') || '{}');
      console.log('localStorage test:', localStorageTest);
      
      // List all keys in localForage
      const keys = await localforage.keys();
      console.log('localForage keys:', keys);
      
    } catch (error) {
      console.error('Storage debug error:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('=== Starting to load data ===');
        setLoading(true);
        
        // Run storage debug
        await debugStorage();
        
        // 1. Load current user - try localForage first, then fallback to localStorage
        console.log('1. Loading current user...');
        let currentUser = await localforage.getItem('currentUser');
        
        // Fallback to localStorage if not found in localForage
        if (!currentUser) {
          console.log('User not found in localForage, checking localStorage...');
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            currentUser = JSON.parse(storedUser);
            console.log('Found user in localStorage, migrating to localForage...');
            await localforage.setItem('currentUser', currentUser);
          } else {
            console.error('No user found in any storage, redirecting to signin');
            navigate('/signin');
            return;
          }
        }
        
        // Ensure user has an ID
        if (!currentUser.id) {
          console.error('User has no ID, cannot load habits');
          setLoading(false);
          return;
        }
        
        console.log('Current user from storage:', currentUser);
        
        if (!currentUser) {
          console.error('No current user found, redirecting to signin');
          navigate('/signin');
          return;
        }
        
        if (!currentUser.id) {
          console.error('Current user has no ID!', currentUser);
          throw new Error('Current user has no ID');
        }
        
        setUser(currentUser);
        
        // 2. Load user's habits from both storage systems
        console.log('2. Loading habits...');
        const storageKey = `habits_${currentUser.id}`;
        console.log('Using storage key:', storageKey);
        
        let habits = [];
        try {
          // Try localForage first
          let storedHabits = await localforage.getItem(storageKey);
          console.log('Habits from localForage:', storedHabits);
          
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
          
          habits = Array.isArray(storedHabits) ? storedHabits : [];
          console.log('Final habits array:', habits);
          
        } catch (error) {
          console.error('Error loading habits:', error);
          habits = [];
        }
        
        // 4. Update state with loaded habits
        console.log('4. Updating habits state with:', habits);
        setHabits(habits);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Refresh habits when the component regains focus
    const handleFocus = () => {
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [navigate]);

  const isHabitCompleted = (habit, date) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    const completion = habit.completedDates.find(d => d.date === dateStr);
    return completion ? completion.completed : false;
  };

  const toggleHabitCompletion = async (habitId) => {
    try {
      const currentUser = await localforage.getItem('currentUser');
      if (!currentUser) return;

      const updatedHabits = habits.map(habit => {
        if (habit.id === habitId) {
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
          let completedDates = [...(habit.completedDates || [])];
          
          // Check if habit is already completed for this date
          const existingIndex = completedDates.findIndex(d => d.date === dateStr);
          
          if (existingIndex === -1) {
            // Add new completion
            completedDates.push({
              date: dateStr,
              day: dayOfWeek,
              completed: true
            });
          } else {
            // Toggle completion status
            completedDates[existingIndex] = {
              ...completedDates[existingIndex],
              completed: !completedDates[existingIndex].completed
            };
          }

          return {
            ...habit,
            completedDates,
            lastCompleted: dateStr,
            lastUpdated: new Date().toISOString()
          };
        }
        return habit;
      });

      // Save user data to storage
      const saveUserData = async (userData) => {
        try {
          // Save to both localForage and localStorage for redundancy
          await localforage.setItem('currentUser', userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
          setUser(userData);
          console.log('User data saved to both storage systems');
        } catch (error) {
          console.error('Error saving user data:', error);
          // Fallback to localStorage if localForage fails
          try {
            localStorage.setItem('currentUser', JSON.stringify(userData));
            console.log('Fallback: User data saved to localStorage only');
          } catch (fallbackError) {
            console.error('Error saving to localStorage:', fallbackError);
          }
        }
      };

      await localforage.setItem(`habits_${currentUser.id}`, updatedHabits);
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const getHabitProgress = (habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // For daily habits
    if (habit.frequency === 'daily') {
      const todayCompleted = habit.completedDates.some(d => 
        d.date === todayStr && d.completed
      );
      return todayCompleted ? 100 : 0;
    }
    
    // For weekly habits
    if (habit.frequency === 'weekly') {
      // Get start of current week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      // Get all days of the current week (7 days)
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return format(date, 'yyyy-MM-dd');
      });
      
      // Get all completions for this week
      const weeklyCompletions = habit.completedDates.filter(d => 
        weekDays.includes(d.date)
      );
      
      // Count completed days (only count if completed is true)
      const completedDays = weeklyCompletions.filter(d => d.completed).length;
      
      // Debug log
      console.log('Weekly progress:', {
        habitName: habit.name,
        today: todayStr,
        weekStart: format(startOfWeek, 'yyyy-MM-dd'),
        weekEnd: format(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6), 'yyyy-MM-dd'),
        weekDays,
        completedDays,
        totalDays: 7,
        completions: weeklyCompletions,
        allCompletions: habit.completedDates
      });
      
      // Calculate progress based on 7-day week
      const progress = Math.round((completedDays / 7) * 100);
      return Math.min(progress, 100); // Cap at 100%
    }
    
    // For monthly habits
    if (habit.frequency === 'monthly') {
      // Get the first and last day of the current month
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
      
      // Get habit creation date
      const habitCreatedDate = new Date(habit.createdAt);
      const habitCreatedMonth = habitCreatedDate.getMonth();
      const habitCreatedYear = habitCreatedDate.getFullYear();
      
      // If this is the first month of the habit
      if (currentMonth === habitCreatedMonth && currentYear === habitCreatedYear) {
        // Only count days from the creation date to the end of the month
        const startDay = habitCreatedDate.getDate();
        const totalPossibleDays = lastDayOfMonth.getDate() - startDay + 1;
        
        // Count completed days from creation date to end of month
        const completedDays = habit.completedDates.filter(d => {
          const date = new Date(d.date);
          const dayOfMonth = date.getDate();
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear &&
            dayOfMonth >= startDay &&
            d.completed
          );
        }).length;
        
        const progress = Math.round((completedDays / totalPossibleDays) * 100);
        return progress > 100 ? 100 : progress;
      }
      
      // For subsequent months, only track the current month
      const completedDays = habit.completedDates.filter(d => {
        const date = new Date(d.date);
        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear &&
          d.completed
        );
      }).length;
      
      console.log('Monthly progress:', {
        habitName: habit.name,
        completedDays,
        daysInMonth,
        currentMonth: today.toLocaleString('default', { month: 'long' }),
        completedDates: habit.completedDates
      });
      
      // Return percentage of completed days in the month
      const progress = Math.round((completedDays / daysInMonth) * 100);
      return progress > 100 ? 100 : progress; // Cap at 100%
    }
    
    return 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'background.paper', mb: 3 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Habit Tracker
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              startIcon={<CalendarTodayIcon />}
              onClick={() => navigate('/calendar')}
              sx={{ textTransform: 'none' }}
            >
              Calendar
            </Button>
            <IconButton color="inherit">
              <NotificationsNoneIcon />
            </IconButton>
            <IconButton onClick={() => navigate('/profile')}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {/* Day Selector */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 4,
            backgroundColor: theme.palette.background.paper,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <Box display="flex" justifyContent="space-between" width="100%" minWidth="500px">
            {days.map((date, index) => {
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              
              return (
                <DayButton
                  key={index}
                  selected={isSelected}
                  onClick={() => setSelectedDate(date)}
                  sx={{
                    border: isTodayDate && !isSelected 
                      ? `1px solid ${theme.palette.primary.main}` 
                      : '1px solid transparent',
                  }}
                >
                  <Typography variant="caption" component="div">
                    {format(date, 'EEE')}
                  </Typography>
                  <Typography variant="h6" component="div">
                    {format(date, 'd')}
                  </Typography>
                </DayButton>
              );
            })}
          </Box>
        </Paper>

        {/* Habits List */}
        <Typography variant="h5" component="h2" gutterBottom>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </Typography>

        {habits.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No habits yet
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/habits/new')}
              sx={{ mt: 2 }}
            >
              Add Your First Habit
            </Button>
          </Box>
        ) : (
          <Box>
            {habits.map((habit) => (
              <HabitCard key={habit.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Tooltip title={isHabitCompleted(habit, selectedDate) ? 'Mark as incomplete' : 'Mark as complete'}>
                      <IconButton 
                        onClick={() => toggleHabitCompletion(habit.id)}
                        color={isHabitCompleted(habit, selectedDate) ? 'success' : 'default'}
                        sx={{ mr: 1 }}
                      >
                        {isHabitCompleted(habit, selectedDate) ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <RadioButtonUncheckedIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Box flexGrow={1}>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                          textDecoration: isHabitCompleted(habit, selectedDate) ? 'line-through' : 'none' 
                        }}
                      >
                        {habit.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {habit.completedDates?.length || 0} {habit.completedDates?.length === 1 ? 'completion' : 'completions'}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: habit.color || 'primary.main', 
                        ml: 2 
                      }} 
                    />
                  </Box>
                  
                  <Box display="flex" alignItems="center" mt={2}>
                    <Box width="100%" mr={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getHabitProgress(habit)} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: habit.color || 'primary.main'
                          }
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {Math.round(getHabitProgress(habit))}%
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="caption" color="textSecondary">
                      {habit.frequency === 'daily' ? 'Daily' : 
                       habit.frequency === 'weekdays' ? 'Weekdays' : 
                       habit.frequency === 'weekly' ? 'Weekly' : 
                       habit.frequency === 'monthly' ? 'Monthly' : 'Custom'}
                    </Typography>
                    {habit.lastCompleted && (
                      <Typography variant="caption" color="textSecondary">
                        Last: {format(parseISO(habit.lastCompleted), 'MMM d')}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </HabitCard>
            ))}
          </Box>
        )}
      </Container>

      {/* Add Habit Button */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/habits/new')}
          sx={{
            borderRadius: '50%',
            minWidth: '56px',
            width: '56px',
            height: '56px',
            boxShadow: theme.shadows[4],
            '&:hover': {
              boxShadow: theme.shadows[8],
            },
          }}
        >
          <AddIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardScreen;
