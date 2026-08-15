import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'glass-effect border border-white/10 !bg-slate-900 !text-slate-100 text-sm rounded-xl',
          duration: 3000,
        }}
      />
      <App />
    </Provider>
  </React.StrictMode>,
);

