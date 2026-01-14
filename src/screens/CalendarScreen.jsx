import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  Checkbox,
  Chip,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { format, isSameDay, parseISO, addDays, isToday, isTomorrow } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import AddTaskDialog from '../components/AddTaskDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Local storage key
const STORAGE_KEY = 'habitTrackerTasks';

function CalendarScreen() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openAddTask, setOpenAddTask] = useState(false);
  const [tasks, setTasks] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const loadTasks = () => {
      try {
        setLoading(true);
        const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        setTasks(savedTasks);
        setSnackbar({
          open: true,
          message: 'Tasks loaded successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load tasks',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks:', error);
        setSnackbar({
          open: true,
          message: 'Failed to save tasks',
          severity: 'error'
        });
      }
    }
  }, [tasks, loading]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddTask = (task) => {
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const taskWithId = {
        ...task,
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTasks(prevTasks => ({
        ...prevTasks,
        [dateKey]: [...(prevTasks[dateKey] || []), taskWithId]
      }));
      
      showSnackbar('Task added successfully');
      setOpenAddTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
      showSnackbar('Failed to add task', 'error');
    }
  };

  const handleUpdateTask = (updatedTask) => {
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      
      setTasks(prevTasks => {
        const updatedTasks = {
          ...prevTasks,
          [dateKey]: (prevTasks[dateKey] || []).map(task => 
            task.id === updatedTask.id 
              ? { ...updatedTask, updatedAt: new Date().toISOString() } 
              : task
          )
        };
        return updatedTasks;
      });
      
      showSnackbar('Task updated successfully');
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      showSnackbar('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = (taskId) => {
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      
      setTasks(prevTasks => {
        const updatedTasks = {
          ...prevTasks,
          [dateKey]: (prevTasks[dateKey] || []).filter(task => task.id !== taskId)
        };
        
        // Remove the date key if no tasks left
        if (updatedTasks[dateKey].length === 0) {
          delete updatedTasks[dateKey];
        }
        
        return updatedTasks;
      });
      
      showSnackbar('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      showSnackbar('Failed to delete task', 'error');
    }
  };

  const toggleTaskCompletion = (task) => {
    const updatedTask = { 
      ...task, 
      completed: !task.completed,
      updatedAt: new Date().toISOString() 
    };
    handleUpdateTask(updatedTask);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  const safeDate = selectedDate || new Date();
  const dateKey = format(safeDate, 'yyyy-MM-dd');
  const dateTasks = tasks[dateKey] || [];

  // Get all tasks for the month to show in calendar
  const monthTasks = Object.entries(tasks).reduce((acc, [date, tasksForDate]) => {
    if (date.startsWith(format(safeDate, 'yyyy-MM'))) {
      acc[date] = tasksForDate;
    }
    return acc;
  }, {});

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Calendar
          </Typography>
          <Box>
            <Tooltip title="View habits for selected date">
              <Button
                variant="outlined"
                startIcon={<CalendarViewDayIcon />}
                onClick={() => navigate('/dashboard', { state: { selectedDate: selectedDate.toISOString() } })}
                sx={{ mr: 2 }}
              >
                View Habits
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddTask(true)}
            >
              Add Task
            </Button>
          </Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {format(safeDate, 'MMMM yyyy')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          <Paper elevation={3} sx={{ p: 2, minWidth: 350, borderRadius: 3, height: 'fit-content' }}>
            <DateCalendar
              value={safeDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              sx={{ 
                width: '100%',
                '& .MuiDayCalendar-header span': {
                  fontWeight: 'bold',
                  color: 'text.primary',
                },
                '& .MuiPickersDay-root': {
                  width: 36,
                  height: 36,
                  margin: '0 2px',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                  '&.MuiPickersDay-today': {
                    border: '1px solid',
                    borderColor: 'primary.main',
                    backgroundColor: 'transparent',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                  },
                },
                '& .has-tasks::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                },
              }}
              slotProps={{
                day: (ownerState) => {
                  const date = new Date(ownerState.day);
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const hasTasks = tasks[dateKey]?.length > 0;
                  const isToday = isSameDay(date, new Date());
                  
                  return {
                    className: `${hasTasks ? 'has-tasks' : ''} ${isToday ? 'MuiPickersDay-today' : ''}`,
                    children: format(date, 'd')
                  };
                },
              }}
            />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Quick Filters
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label="Today" 
                  onClick={() => setSelectedDate(new Date())} 
                  variant={isSameDay(selectedDate, new Date()) ? 'filled' : 'outlined'}
                  color="primary"
                />
                <Chip 
                  label="Tomorrow" 
                  onClick={() => setSelectedDate(addDays(new Date(), 1))}
                  variant={isSameDay(selectedDate, addDays(new Date(), 1)) ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Next Week" 
                  onClick={() => setSelectedDate(addDays(new Date(), 7))}
                  variant={isSameDay(selectedDate, addDays(new Date(), 7)) ? 'filled' : 'outlined'}
                />
              </Box>
            </Box>
          </Paper>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'}
                </Typography>
              </Box>
              
              {dateTasks.length > 0 ? (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {dateTasks.map((task) => (
                    <React.Fragment key={task.id}>
                      <ListItem 
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: task.completed ? 'action.hover' : 'background.paper',
                          opacity: task.completed ? 0.7 : 1,
                          textDecoration: task.completed ? 'line-through' : 'none',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <Checkbox
                          edge="start"
                          checked={task.completed}
                          tabIndex={-1}
                          disableRipple
                          onChange={() => toggleTaskCompletion(task)}
                        />
                        <ListItemText 
                          primary={
                            <Typography 
                              variant="subtitle1" 
                              sx={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? 'text.secondary' : 'text.primary',
                              }}
                            >
                              {task.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              {task.description && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                  }}
                                >
                                  {task.description}
                                </Typography>
                              )}
                              {task.time && (
                                <Chip 
                                  label={task.time} 
                                  size="small" 
                                  sx={{ mt: 0.5, mr: 1 }}
                                />
                              )}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            aria-label="edit" 
                            onClick={() => {
                              setEditingTask(task);
                              setOpenAddTask(true);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" variant="inset" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    p: 4, 
                    border: '2px dashed', 
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    No tasks for this day
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => setOpenAddTask(true)}
                    startIcon={<AddIcon />}
                  >
                    Add your first task
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>

          <AddTaskDialog
            open={openAddTask}
            onClose={() => {
              setOpenAddTask(false);
              setEditingTask(null);
            }}
            onSave={editingTask ? handleUpdateTask : handleAddTask}
            selectedDate={selectedDate}
            task={editingTask}
          />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default CalendarScreen;
