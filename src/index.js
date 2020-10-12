import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import AppRouter from './AppRouter'
import { AuthProvider } from "./util/Auth";

{/* <AuthProvider>
        <AppRouter />
</AuthProvider>,  */}

ReactDOM.render(
    <App />,
     document.getElementById('root'));

registerServiceWorker();
