import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskService from '../services/taskService';

const initialState = {
  isLoading: false,
  error: null,
};

// Add a new task
export const addTask = createAsyncThunk(
  'task/add',
  async (taskData, thunkAPI) => {
    try {
      return await taskService.createTask(taskData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Edit an existing task
export const editTask = createAsyncThunk(
  'task/edit',
  async ({ id, taskData }, thunkAPI) => {
    try {
      return await taskService.updateTask(id, taskData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Relocate a task (column and order index change)
export const relocateTask = createAsyncThunk(
  'task/relocate',
  async ({ id, moveData }, thunkAPI) => {
    try {
      return await taskService.moveTask(id, moveData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove a task
export const removeTask = createAsyncThunk(
  'task/remove',
  async (id, thunkAPI) => {
    try {
      await taskService.deleteTask(id);
      return id; // Return the deleted task ID so reducer can prune it
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Task
      .addCase(addTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Edit Task
      .addCase(editTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editTask.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(editTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Relocate Task
      .addCase(relocateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(relocateTask.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(relocateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove Task
      .addCase(removeTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeTask.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;
