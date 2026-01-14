import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const theme = useTheme();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate 7 days starting from today
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await localforage.getItem('currentUser');
        setUser(currentUser);

        if (currentUser) {
          // Load habits for the current user
          const userHabits = await localforage.getItem(`habits_${currentUser.id}`) || [];
          setHabits(userHabits);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const isHabitCompleted = (habit, date) => {
    if (!habit.completedDates) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completedDates.includes(dateStr);
  };

  const toggleHabitCompletion = async (habitId) => {
    try {
      const currentUser = await localforage.getItem('currentUser');
      if (!currentUser) return;

      const updatedHabits = habits.map(habit => {
        if (habit.id === habitId) {
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          let completedDates = [...(habit.completedDates || [])];
          
          const dateIndex = completedDates.indexOf(dateStr);
          if (dateIndex === -1) {
            completedDates.push(dateStr);
          } else {
            completedDates.splice(dateIndex, 1);
          }

          return {
            ...habit,
            completedDates,
            lastCompleted: dateStr
          };
        }
        return habit;
      });

      await localforage.setItem(`habits_${currentUser.id}`, updatedHabits);
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const getHabitProgress = (habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    // Count how many times the habit was completed in the last 7 days
    const lastWeek = Array.from({ length: 7 }, (_, i) => {
      return format(addDays(new Date(), -i), 'yyyy-MM-dd');
    });
    
    const completedThisWeek = habit.completedDates.filter(date => 
      lastWeek.includes(date)
    ).length;
    
    return Math.min(100, (completedThisWeek / 7) * 100);
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
