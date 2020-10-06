import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import AppRouter from './AppRouter'
import { AuthProvider } from "./util/Auth";

ReactDOM.render(
    <AuthProvider>
        <AppRouter />
     </AuthProvider>, 
     document.getElementById('root'));

registerServiceWorker();
