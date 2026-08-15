import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, disconnectSocket } from '../services/socket';
import {
  taskCreatedFromSocket,
  taskUpdatedFromSocket,
  taskMovedFromSocket,
  taskDeletedFromSocket,
  setPresence,
} from '../store/boardSlice';

function useSocket(boardId) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!boardId || !user) return;

    // Connect socket with user auth context
    const token = user.token;
    const socket = connectSocket(token);

    // Join board room
    socket.emit('join_board', {
      boardId,
      user: { _id: user._id, name: user.name },
    });

    // Handle incoming events from board
    socket.on('task_created', (task) => {
      console.log('Live Sync: task_created received', task);
      dispatch(taskCreatedFromSocket(task));
    });

    socket.on('task_updated', (task) => {
      console.log('Live Sync: task_updated received', task);
      dispatch(taskUpdatedFromSocket(task));
    });

    socket.on('task_moved', (data) => {
      console.log('Live Sync: task_moved received', data);
      dispatch(taskMovedFromSocket(data));
    });

    socket.on('task_deleted', (data) => {
      console.log('Live Sync: task_deleted received', data);
      dispatch(taskDeletedFromSocket(data));
    });

    socket.on('user_presence', (users) => {
      console.log('Live Sync: user_presence received', users);
      dispatch(setPresence(users));
    });

    // Unmount cleanup: leave room, turn off listeners, and disconnect
    return () => {
      socket.emit('leave_board', { boardId });
      
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_moved');
      socket.off('task_deleted');
      socket.off('user_presence');
      
      disconnectSocket();
    };
  }, [boardId, user, dispatch]);
}

export default useSocket;
