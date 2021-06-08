import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClientProvider } from 'react-query';
import App from './App';
import { queryClient } from './graphqlConfig';

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient} />
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

