/* Il tuo file: src/main.tsx (PULITO) */

import 'antd/dist/reset.css'; // Stile globale di Antd
import 'bootstrap/dist/css/bootstrap.min.css'; // Stile globale di Bootstrap
import './index.css'; // I tuoi stili globali (sfondo, reset, ecc.)


import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 1. Importiamo SOLO il componente "genitore"
import App from './App';

// 2. Avviamo l'applicazione
ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* 3. Renderizziamo SOLO <App /> */}
      <App />
    </BrowserRouter>
  </StrictMode>,
);