import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import boardReducer from './boardSlice';
import taskReducer from './taskSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
    task: taskReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents warning issues for complex schemas
    }),
});
