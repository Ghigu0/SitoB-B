/* Il tuo file: src/components/BookingForm.tsx */

import React, { useState } from 'react';
import { DatePicker, Space, Button } from 'antd';
import type { Dayjs } from 'dayjs'; // Importiamo i "tipi" per TypeScript
import { useAuth } from './AuthContext'

// 1. IMPORTIAMO DAYJS: Antd ha bisogno di questa libreria per gestire le date
// Dovrai installarla! Vai nel terminale e scrivi:
// npm install dayjs
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// --- FASE 2 (Simulata): I Dati dal Database ---
// In futuro, questo array arriverà da un'API (fetch).
// Per ora, lo scriviamo a mano.
const dateOccupate = [
  '2025-11-20',
  '2025-11-21',
  '2025-11-28',
  '2025-12-24',
  '2025-12-25',
];

function BookingForm() {

    const { isAdmin } = useAuth();
  
  // --- FASE 1: Lo Stato del Frontend ---
  // Salviamo le date scelte dall'utente
  const [dateSelezionate, setDateSelezionate] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // --- FASE 3: Il "Bridge" (La Logica di Disabilitazione) ---
  const disabilitaDate = (current: Dayjs) => {
    // 'current' è il giorno che antd sta controllando (es. 1, 2, 3... Nov)

    // 1. Disabilita tutti i giorni PRIMA di oggi
    // (Non puoi prenotare nel passato)
    if (current && current < dayjs().startOf('day')) {
      return true;
    }

    // 2. Disabilita i giorni che sono nel nostro array 'dateOccupate'
    // Formattiamo 'current' in 'YYYY-MM-DD' per confrontarlo
    const dataFormattata = current.format('YYYY-MM-DD');
    if (dateOccupate.includes(dataFormattata)) {
      return true; // Se è nell'array, disabilitalo!
    }

    // Se non è nel passato e non è occupato...
    return false; // ...allora è cliccabile!
  };

  const onDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateSelezionate(dates);
    console.log('Date selezionate dall\'utente:', dates);
  };
  
  const handlePrenota = () => {
    // Qui è dove, in futuro, manderai 'dateSelezionate'
    // al tuo backend per salvarle nel database
    alert(`Hai selezionato: 
      Check-in: ${dateSelezionate?.[0]?.format('DD/MM/YYYY')}
      Check-out: ${dateSelezionate?.[1]?.format('DD/MM/YYYY')}
      
      ...invio al backend in corso...`);
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Prenota il tuo soggiorno</h2>
      <Space direction="vertical" size={12}>
        <RangePicker
          onChange={onDateChange}       // Salva le date nello stato
          disabledDate={disabilitaDate} // La nostra funzione magica!
          size="large"
        />
        <Button 
          type="primary" 
          size="large" 
          onClick={handlePrenota}
          disabled={!dateSelezionate} // Il bottone è disabilitato se non hai scelto le date
        >
          Verifica e Prenota
        </Button>
      </Space>
    </div>
  );
}

export default BookingForm;