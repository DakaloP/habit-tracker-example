import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  FormControlLabel,
  Checkbox,
  Chip,
  Stack,
  useTheme,
  Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isToday, isTomorrow, addDays, isSameDay } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TodayIcon from '@mui/icons-material/Today';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const TASK_TYPES = [
  { value: 'task', label: 'Task', color: 'primary' },
  { value: 'meeting', label: 'Meeting', color: 'secondary' },
  { value: 'reminder', label: 'Reminder', color: 'warning' },
  { value: 'event', label: 'Event', color: 'success' },
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'On weekdays' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function AddTaskDialog({ open, onClose, onSave, selectedDate, task }) {
  const theme = useTheme();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [taskType, setTaskType] = useState(task?.type || 'task');
  const [dueDate, setDueDate] = useState(task?.date ? new Date(task.date) : selectedDate);
  const [time, setTime] = useState(task?.time || null);
  const [isAllDay, setIsAllDay] = useState(task?.allDay || false);
  const [recurrence, setRecurrence] = useState(task?.recurrence || 'none');
  const [errors, setErrors] = useState({});
  
  // Reset form when task prop changes (for edit mode)
  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setTaskType(task.type || 'task');
        setDueDate(task.date ? new Date(task.date) : selectedDate);
        setTime(task.time || null);
        setIsAllDay(task.allDay || false);
        setRecurrence(task.recurrence || 'none');
      } else {
        setTitle('');
        setDescription('');
        setTaskType('task');
        setDueDate(selectedDate);
        setTime(null);
        setIsAllDay(false);
        setRecurrence('none');
      }
      setErrors({});
    }
  }, [open, task, selectedDate]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!taskType) newErrors.taskType = 'Please select a task type';
    if (!isAllDay && !time) newErrors.time = 'Please select a time or mark as all-day';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleDateChange = (newDate) => {
    setDueDate(newDate);
  };
  
  const handleQuickDateSelect = (daysToAdd) => {
    const newDate = addDays(new Date(), daysToAdd);
    setDueDate(newDate);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const taskData = {
        ...(task?.id && { id: task.id }), // Include ID if editing
        title,
        description,
        type: taskType,
        date: dueDate,
        time: isAllDay ? null : time,
        allDay: isAllDay,
        recurrence: recurrence === 'none' ? undefined : recurrence,
        completed: task?.completed || false,
        createdAt: task?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      onSave(taskData);
      onClose();
    }
  };

  const isEditMode = !!task?.id;
  const selectedTaskType = TASK_TYPES.find(type => type.value === taskType) || TASK_TYPES[0];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          [theme.breakpoints.down('sm')]: {
            margin: 1,
            width: '100%',
          },
        },
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: `${selectedTaskType.color}.main`,
            mr: 1 
          }} />
          <Typography variant="h6" component="span">
            {isEditMode ? 'Edit Task' : 'Add New Task'}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Task Title */}
            <TextField
              label="Task Title"
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              autoFocus
            />
            
            {/* Task Description */}
            <TextField
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="medium"
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            
            {/* Task Type */}
            <FormControl fullWidth margin="normal" error={!!errors.taskType}>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={taskType}
                label="Task Type"
                onChange={(e) => setTaskType(e.target.value)}
                sx={{
                  borderRadius: 2,
                }}
              >
                {TASK_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: `${type.color}.main` 
                        }} 
                      />
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.taskType && (
                <FormHelperText>{errors.taskType}</FormHelperText>
              )}
            </FormControl>

            {/* Date & Time Selection */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Date & Time
              </Typography>
              
              {/* Quick Date Selection */}
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  icon={<TodayIcon />} 
                  label="Today" 
                  onClick={() => handleQuickDateSelect(0)}
                  variant={isToday(dueDate) ? 'filled' : 'outlined'}
                  color={isToday(dueDate) ? 'primary' : 'default'}
                  size="small"
                />
                <Chip 
                  icon={<EventAvailableIcon />} 
                  label="Tomorrow" 
                  onClick={() => handleQuickDateSelect(1)}
                  variant={isTomorrow(dueDate) ? 'filled' : 'outlined'}
                  color={isTomorrow(dueDate) ? 'primary' : 'default'}
                  size="small"
                />
                <Chip 
                  icon={<EventAvailableIcon />} 
                  label="Next Week" 
                  onClick={() => handleQuickDateSelect(7)}
                  variant={isSameDay(dueDate, addDays(new Date(), 7)) ? 'filled' : 'outlined'}
                  color={isSameDay(dueDate, addDays(new Date(), 7)) ? 'primary' : 'default'}
                  size="small"
                />
              </Stack>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <DateTimePicker
                    label="Date"
                    value={dueDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    )}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={isAllDay}
                          onChange={(e) => setIsAllDay(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="All day"
                      sx={{ mr: 0, minWidth: 'fit-content' }}
                    />
                    
                    {!isAllDay && (
                      <TimePicker
                        label="Time"
                        value={time || dueDate}
                        onChange={(newTime) => setTime(newTime)}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            sx={{
                              minWidth: 120,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                            error={!!errors.time}
                            helperText={errors.time}
                          />
                        )}
                      />
                    )}
                  </Box>
                </Box>
              </LocalizationProvider>
            </Box>
            
            {/* Recurrence */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Recurrence</InputLabel>
              <Select
                value={recurrence}
                label="Recurrence"
                onChange={(e) => setRecurrence(e.target.value)}
                sx={{
                  borderRadius: 2,
                }}
              >
                {RECURRENCE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button 
            onClick={onClose} 
            color="inherit"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            size="large"
            sx={{ 
              borderRadius: 2, 
              px: 4,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
              },
            }}
          >
            {isEditMode ? 'Update Task' : 'Add Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddTaskDialog;
