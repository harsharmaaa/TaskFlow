import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import boardService from '../services/boardService';
import { editTask, removeTask } from './taskSlice';

const initialState = {
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,
  presence: [],
};

// Fetch all boards user belongs to
export const fetchBoards = createAsyncThunk(
  'board/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await boardService.getBoards();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new board
export const addBoard = createAsyncThunk(
  'board/add',
  async (boardData, thunkAPI) => {
    try {
      return await boardService.createBoard(boardData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch a single board by ID (with columns + tasks nested)
export const fetchBoardById = createAsyncThunk(
  'board/fetchById',
  async (id, thunkAPI) => {
    try {
      return await boardService.getBoardById(id);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
      state.presence = [];
    },
    clearBoardError: (state) => {
      state.error = null;
    },
    moveTaskOptimistically: (state, action) => {
      const { taskId, sourceColId, destColId, targetIndex } = action.payload;

      if (!state.currentBoard || !state.currentBoard.columns) return;

      const sourceCol = state.currentBoard.columns.find((c) => c._id === sourceColId);
      const destCol = state.currentBoard.columns.find((c) => c._id === destColId);

      if (!sourceCol || !destCol) return;

      const taskIdx = sourceCol.tasks.findIndex((t) => t._id === taskId);
      if (taskIdx === -1) return;

      const [movedTask] = sourceCol.tasks.splice(taskIdx, 1);
      movedTask.column = destColId;
      destCol.tasks.splice(targetIndex, 0, movedTask);

      sourceCol.tasks.forEach((t, i) => {
        t.order = i;
      });
      destCol.tasks.forEach((t, i) => {
        t.order = i;
      });
    },
    setPresence: (state, action) => {
      state.presence = action.payload;
    },
    taskCreatedFromSocket: (state, action) => {
      const task = action.payload;
      if (!state.currentBoard || !state.currentBoard.columns) return;

      const column = state.currentBoard.columns.find((c) => c._id === task.column);
      if (column) {
        const exists = column.tasks.some((t) => t._id === task._id);
        if (!exists) {
          column.tasks.push(task);
          column.tasks.sort((a, b) => a.order - b.order);
        }
      }
    },
    taskUpdatedFromSocket: (state, action) => {
      const updatedTask = action.payload;
      if (!state.currentBoard || !state.currentBoard.columns) return;

      state.currentBoard.columns.forEach((col) => {
        const idx = col.tasks.findIndex((t) => t._id === updatedTask._id);
        if (idx !== -1) {
          col.tasks[idx] = updatedTask;
        }
      });
    },
    taskMovedFromSocket: (state, action) => {
      const { taskId, newColumn, newOrder } = action.payload;
      if (!state.currentBoard || !state.currentBoard.columns) return;

      let movedTask = null;
      state.currentBoard.columns.forEach((col) => {
        const idx = col.tasks.findIndex((t) => t._id === taskId);
        if (idx !== -1) {
          [movedTask] = col.tasks.splice(idx, 1);
        }
      });

      if (movedTask) {
        const destCol = state.currentBoard.columns.find((c) => c._id === newColumn);
        if (destCol) {
          movedTask.column = newColumn;
          destCol.tasks.splice(newOrder, 0, movedTask);
          destCol.tasks.forEach((t, i) => {
            t.order = i;
          });
        }
      }
    },
    taskDeletedFromSocket: (state, action) => {
      const { taskId } = action.payload;
      if (!state.currentBoard || !state.currentBoard.columns) return;

      state.currentBoard.columns.forEach((col) => {
        const idx = col.tasks.findIndex((t) => t._id === taskId);
        if (idx !== -1) {
          col.tasks.splice(idx, 1);
          col.tasks.forEach((t, i) => {
            t.order = i;
          });
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Boards
      .addCase(fetchBoards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Board
      .addCase(addBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBoard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards.unshift(action.payload); // Add new board to top of list
      })
      .addCase(addBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Board By ID
      .addCase(fetchBoardById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBoard = action.payload;
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Edit Task (local action fulfilled)
      .addCase(editTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        if (!state.currentBoard || !state.currentBoard.columns) return;
        state.currentBoard.columns.forEach((col) => {
          const idx = col.tasks.findIndex((t) => t._id === updatedTask._id);
          if (idx !== -1) {
            col.tasks[idx] = updatedTask;
          }
        });
      })
      // Remove Task (local action fulfilled)
      .addCase(removeTask.fulfilled, (state, action) => {
        const deletedTaskId = action.payload;
        if (!state.currentBoard || !state.currentBoard.columns) return;
        state.currentBoard.columns.forEach((col) => {
          const idx = col.tasks.findIndex((t) => t._id === deletedTaskId);
          if (idx !== -1) {
            col.tasks.splice(idx, 1);
            col.tasks.forEach((t, i) => {
              t.order = i;
            });
          }
        });
      });
  },
});

export const {
  clearCurrentBoard,
  clearBoardError,
  moveTaskOptimistically,
  setPresence,
  taskCreatedFromSocket,
  taskUpdatedFromSocket,
  taskMovedFromSocket,
  taskDeletedFromSocket,
} = boardSlice.actions;
export default boardSlice.reducer;
