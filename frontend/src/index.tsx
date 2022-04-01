import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AuthenticatedUserContextProvider from './components/AuthenticatedUsers/AuthenticatedUserProvider';
import './index.css';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        useRefreshTokens
        cacheLocation='memory'
        audience='https://coveytown.com/api'
        domain='harrymerzin.auth0.com'
        clientId='cEVvHBp7TMMUFxSr0PQWvkuhZkV9Tzxf'
        scope='profile email'
        redirectUri='http://localhost:3000'>
        <AuthenticatedUserContextProvider>
          <App />
        </AuthenticatedUserContextProvider>
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
