import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import boardReducer from './boardSlice';
import taskReducer from './taskSlice';

// Temporary placeholder reducers to satisfy slice dependencies for future steps
const placeholderReducer = (state = { items: [], loading: false, error: null }, action) => {
  return state;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
    task: taskReducer,
    notification: placeholderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents warning issues for complex schemas
    }),
});
