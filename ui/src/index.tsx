import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntdApp } from 'antd';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <AntdApp>
    <App />
  </AntdApp>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    console.log('[PWA] New content is available; please refresh.');
  },
  onSuccess: (registration) => {
    console.log('[PWA] Content is cached for offline use.');
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
