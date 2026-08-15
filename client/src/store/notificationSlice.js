import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../services/notificationService';

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notification/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await notificationService.getNotifications();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark a single notification as read
export const markRead = createAsyncThunk(
  'notification/markRead',
  async (id, thunkAPI) => {
    try {
      return await notificationService.markNotificationAsRead(id);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark all notifications as read
export const markAllRead = createAsyncThunk(
  'notification/markAllRead',
  async (_, thunkAPI) => {
    try {
      return await notificationService.markAllNotificationsAsRead();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    notificationReceived: (state, action) => {
      const exists = state.notifications.some((n) => n._id === action.payload._id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark Read
      .addCase(markRead.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.notifications.findIndex((n) => n._id === updated._id);
        if (idx !== -1) {
          state.notifications[idx] = updated;
        }
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      })
      // Mark All Read
      .addCase(markAllRead.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = 0;
      });
  },
});

export const { notificationReceived } = notificationSlice.actions;
export default notificationSlice.reducer;
