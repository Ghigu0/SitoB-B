/* Il tuo file: src/App.tsx (IL NUOVO "ASSEMBLATORE") */

import React, { Component } from 'react';

// 1. IMPORTA I TUOI "LEGO" (I COMPONENTI)
// (Ho pulito i percorsi, rimuovendo .tsx - è buona pratica)

import Login from './Component/Login.tsx';
import HeaderCore from './Component/HeaderCore.tsx';
import Footer from './Component/Footers';
import BookingForm from './Component/bookingForm';
import ContentManager from './Component/ContentManager';
import InfoManager from './Component/InfoManager';
import Galleria from './Component/Galleria';
import { AuthProvider, useAuth } from './Component/AuthContext.tsx'

// import ExamplesNavbar from './NavBar'; // Commentato, come lo avevi tu


// --- Il Tuo Componente Principale ---
function App() {


  
  
  return (
    // È una buona pratica avvolgere tutto in un <div>
    <div className="App">
     <AuthProvider> 
      {/* <ExamplesNavbar /> */}
      <HeaderCore />
      
     <Login />
     < Galleria />

      {/* Sezione Info & Contatti */}
      <InfoManager />
      
      {/* Sezione Prenotazione */}
      <div className="prenotazione">
        <h1>Prenotazione</h1>
        <BookingForm />
      </div>
       
      {/* Sezione "Cosa Offriamo" */}
      <ContentManager />
       
      {/* Footer */}
      <Footer /> 
    </AuthProvider>
    </div>
  );
}

// 4. Esporta l'App per renderla disponibile a main.tsx
export default App;