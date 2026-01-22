/* Il tuo file: src/Galleria.tsx (CON LOGICA DI ELIMINAZIONE AGGIORNATA E COMMENTI ORIGINALI) */

import { useState, useEffect } from 'react';

// 1. IMPORTA 'Space' e le icone necessarie
import { Image, Button, Modal, Form, Input, Upload, Space } from "antd";
import { PlusOutlined, UploadOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useAuth } from './AuthContext'

import './CSS/Galleria.css'; 


// alla variabile getBase64 associ una funzione, una funzione che accetta come argomento una variabile di nome arbitrario file, di tipo Blob
const getBase64 = (file: Blob): Promise<string> => // non ci sono le graffe perchè new Promise è subito quello che ritorni, come se fai if (); for (){ e qusto for è su più linee }
  new Promise((resolve, reject) => {  // new Promise è un oggetto, non una funzione. come argomento al costruttore viene passato il risultato della funzione ( resolve, reject)=> {}. significa che getBase64 dovrà essere usato con resolve e reject come argomenti di funzione
    const reader = new FileReader(); 
    reader.readAsDataURL(file);  // legge il file e codifica il risultato in Base64 ( url ). è una operazione asincrona
    reader.onload = () => resolve(reader.result as string); // onload dice, " quando hai finito di caricare" esegui questa funzione. chiami resolve e gli passi il risultato della reader
    reader.onerror = (error) => reject(error); // altrimento errore
  });

  // il motivo del wrap con new Promise credo che sia che non puoi fare direttamente getBase64 = new Prosmise, daresti subito un oggetto legato a un file specifico
  /* : Blob: Questo è TypeScript. È un "type-hint" (un'etichetta) che dice: "L'argomento 
  file deve essere di tipo Blob". (Nota: un File caricato da un <Upload> è un tipo speciale di Blob, quindi funziona). */

  /* : Promise<string>: Questo è il tipo di ritorno (return type). Dice: "Questa funzione non restituisce una stringa 
  subito. Restituisce immediatamente una Promise (una promessa) che, in futuro, si 'risolverà' e conterrà una string."*/

  /* nota che andava bene anche
      const getBase64 = (file) => {
      }
      perchè blob e Promise sono controlli di TypeScript
   */

      /* Passi UNA funzione: (resolve, reject) => { ... }. Questa è la tua "lista di istruzioni".

              2. Cosa Fa il Costruttore (Il Processo)
              Il costruttore new Promise(...):

              Crea l'oggetto.

              Genera internamente due funzioni: funzioneSuccesso e funzioneErrore.

              Esegue la tua funzione, passandole quei due strumenti:

              Al posto del tuo parametro resolve -> ti passa funzioneSuccesso.

              Al posto del tuo parametro reject -> ti passa funzioneErrore.

*/
interface ImmagineGalleria { //typescript
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
}



function Galleria() {

  const { isAdmin} = useAuth();
  // guardare questo file dopo InfoManager.tsx
  const [listaImmagini, setListaImmagini] = useState<ImmagineGalleria[]>([]);

  useEffect(() => {
          //funzione per caricare i dati
          const caricaDatiIniziali = async () => { // async sblocca la keyword await dentro la funzione 
            // QUI FAI LA TUA CHIAMATA HTTP
            const response = await fetch('http://localhost:3000/api/inizializzaImg'); // mette in pausa questa funzione fino a che il fetch non è completo
            const datiDalServer = await response.json();
            // console.log("ecco i dati " + datiDalServer); <--- Vecchio log che convertiva in stringa
            console.log("Ecco i dati ricevuti (Array di oggetti):", datiDalServer); // <--- Corretto per vedere l'array
            setListaImmagini(datiDalServer);
          };
  
          caricaDatiIniziali(); // Esegui la funzione
        },[]); // <-- L'array [] vuoto dice a React: "Fallo solo 1 volta". se ci fosse una variabile verrebbe usato ogni volta che la variabile cambia
                // senza variabile viene usata ogni volta che si esegue una render
  

  // classico per il popup (direi dell'aggiungi foto )
  const [isModalVisible, setIsModalVisible] = useState(false);
  // form per inserire l'immagine
  const [form] = Form.useForm();

  // === NUOVE VARIABILI DI STATO PER GESTIRE L'ELIMINAZIONE CON MODAL ===
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [idDaEliminare, setIdDaEliminare] = useState<number | null>(null);
  // Dobbiamo salvarci questa funzione speciale che ci dà Antd per chiudere lo zoom dell'immagine
  const [funzioneChiudiPreview, setFunzioneChiudiPreview] = useState<(() => void) | null>(null);
  
  // funzioni per la variabile IsModalVisible: apri
  const mostraModal = () => {
    setIsModalVisible(true);
  }
  // funzione per nascondere il pop up
  const chiudiModal = () => { 
    setIsModalVisible(false); 
    form.resetFields(); 
  };

 
  const normFile = (e: any) => { if (Array.isArray(e)) { return e; } return e?.fileList; };
  // normFile ha l'obiettivo di prendere un evento e generico che restituisce un insieme di dati strani, e restituire solo l'array dei file
  /* e: Sta per "Event". È il pacco grezzo che il componente <Upload> ti lancia addosso quando l'utente seleziona un file.
  : any: Usiamo any perché questo pacco a volte cambia forma a seconda della versione di Ant Design, quindi non vogliamo essere troppo rigidi coi controlli.
  */

  /* fai comunque 
    if Array.isarray perché in alcuni casi rari (o se inizializzi il form manualmente), potresti passare direttamente la lista dei file invece dell'evento.
  */

  // prende il file caricato da upload e restituisce
  const handleAggiungiFoto = async (values: any) => {
    /* utilizziamo values: any perchè quello che restituisce è un oggetto di questo tipo
              {
            alt: "Descrizione scritta dall'utente",
            immagine: [
              {
                uid: "rc-upload-...",
                name: "foto.jpg",
                status: "done",
                originFileObj: File, // <--- Questo è quello che ci serve!
                // ...altre 20 proprietà tecniche...
              }
            ]
          } 
    
    */
    try {
      const file = values.immagine[0].originFileObj; // prendiamo l'originFileObj
      const imageUrlBase64 = await getBase64(file);

      const nuovaImmagine = {
      src: imageUrlBase64,
      alt: values.alt || 'Nuova foto',
      width: 300,
      height: 200
      };

      // inviamo al backend senza id
      const response = await fetch(`http://localhost:3000/api/modificaImg`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuovaImmagine),
        credentials: 'include' // invia cookie admin_token
      });

      if (!response.ok) throw new Error('Salvataggio fallito');

      const immagineDalServer = await response.json();

      // aggiungiamo l'oggetto alla lista con l'id generato dal backend
      setListaImmagini((immaginiPrecedenti) => [...immaginiPrecedenti, immagineDalServer]);

      chiudiModal();
      } catch (error) {
        console.error('Errore nel salvataggio foto:', error);
        alert('Errore durante il caricamento, riprova.');
      }

  };
  
  // === NUOVA LOGICA ELIMINAZIONE ===

  // Funzione 1: PREPARA l'eliminazione (apre il modal e si salva i dati)
  const apriModalElimina = (id: number, onClosePreview: () => void) => {
    setIdDaEliminare(id);
    // Salviamo la funzione di chiusura preview nello stato così possiamo chiamarla DOPO aver confermato
    setFunzioneChiudiPreview(() => onClosePreview); 
    setIsDeleteModalVisible(true); // Apri il modal
  };

  const chiudiModalElimina = () => {
    setIsDeleteModalVisible(false);
    setIdDaEliminare(null);
    setFunzioneChiudiPreview(null);
  };

  // Funzione 2: ESEGUE l'eliminazione (chiamata quando premi "Elimina" nel modal rosso)
  const handleEseguiEliminazione = async () => {
    if (idDaEliminare === null) return;

    try {
      // Recuperiamo l'oggetto immagine completo per mandarlo al backend (come facevi prima)
      const immagineTrovata = listaImmagini.find( (img) => img.id === idDaEliminare );

        const response = await fetch(`http://localhost:3000/api/eliminaImg`, { 
        method: 'POST',  
        headers: { 
            'Content-Type': 'application/json' 
            // L'header 'Authorization' viene rimosso
        }, 
        body: JSON.stringify(immagineTrovata),
        credentials: 'include' // ✅ Dice al browser di inviare automaticamente il cookie admin_token
      });

    if (!response.ok) throw new Error('Eliminazione Galleria fallita (Verifica il server)');
      setListaImmagini( (immaginiPrecedenti) => immaginiPrecedenti.filter( (img) => img.id !== idDaEliminare )
      );
      
      // Chiudi il popup di anteprima (la galleria a schermo intero)
      if (funzioneChiudiPreview) {
        funzioneChiudiPreview(); 
      }
      
      chiudiModalElimina(); // Chiudi il modal di conferma

    } catch (error) {
       console.error('Errore nella eliminazione:', error);
    }
  };

  return (
    <div className="gallery-container">
      <h1>Le foto del B&B</h1>
      
    
      <div className="gallery-grid">
        <Image.PreviewGroup 
          preview={{
            // 'toolbarRender' ci permette di aggiungere bottoni, è una funzione già stata scritta che ci 
            // permette di usarla mettendo come parametri quei due con le proprietà che vedi dopo ( tipo info.current)
            toolbarRender: (originalToolbar, info) => {
              // 'info.current' è l'indice (0, 1, 2...) della foto che stiamo guardando
              const currentIndex = info.current;
              // Troviamo l'ID univoco di quell'immagine
              const immagineCorrente = listaImmagini[currentIndex];
              
              // Se non troviamo l'immagine (non dovrebbe succedere),
              // mostriamo solo la toolbar normale
              if (!immagineCorrente) return originalToolbar;

              const idCorrente = immagineCorrente.id;
              const onClose = info.actions.onClose; // Funzione per chiudere il popup
              
              return ( // return della toolbarRender
                // Usiamo <Space> per affiancare i bottoni
                <Space size={12}>
                  {/* Il set di bottoni originale (zoom, rotazione) */}
                  {originalToolbar}
                  
                  {/* 5. IL NOSTRO NUOVO BOTTONE ELIMINA! */}
                   {isAdmin && ( <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    // QUI È CAMBIATO: Non eliminiamo subito, ma apriamo il modal
                    onClick={() => apriModalElimina(idCorrente, onClose)}
                  >
                    Elimina
                  </Button> )}
                </Space>
              );
            },
          }}
        > 
          
         
          {listaImmagini.map((immagine) => (
            <Image 
              key={immagine.id}
              className="gallery-thumbnail"
              width={immagine.width}
              height={immagine.height}
              src={immagine.src} 
              alt={immagine.alt}
              placeholder={false}
              style={{ objectFit: 'cover' }}
            />
          ))}
          
        </Image.PreviewGroup >
      </div>    

 <br /> {/* a capo, linebreak, agiunge una riga vuota */}
        {isAdmin && (<Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={mostraModal}
        style={{ marginBottom: '20px' }}
      >
        Aggiungi Foto
      </Button> )}

      {/* ... (La Modale per l'upload è invariata) ... */}
      <Modal 
        title="Aggiungi nuova foto" 
        visible={isModalVisible} 
        onCancel={chiudiModal}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAggiungiFoto}>
          <Form.Item name="alt" label="Descrizione della foto" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="immagine" label="Immagine" valuePropName="fileList" getValueFromEvent={normFile} rules={[{ required: true }]}><Upload listType="picture" maxCount={1} accept="image/png, image/jpeg" beforeUpload={() => false}><Button icon={<UploadOutlined />}>Seleziona File</Button></Upload></Form.Item>
          <Button type="primary" htmlType="submit">Salva Foto</Button>
        </Form>
      </Modal>

      {/* === NUOVO MODAL DI ELIMINAZIONE === */}
      <Modal
        title={<span><ExclamationCircleOutlined style={{ color: 'red', marginRight: 8 }} /> Conferma Eliminazione</span>}
        open={isDeleteModalVisible}
        onOk={handleEseguiEliminazione}
        onCancel={chiudiModalElimina}
        okText="Elimina"
        okType="danger"
        cancelText="Annulla"
        zIndex={2000} // Importante! Deve essere sopra la galleria a schermo intero (che ha z-index alto)
      >
        <p>Sei sicuro di voler eliminare questa foto dalla galleria?</p>
        <p>L'azione è irreversibile.</p>
      </Modal>

    </div>
  );
}

export default Galleria;