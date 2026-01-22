import { useState, useEffect } from 'react';
import { List, Button, Modal, Form, Input, Space } from 'antd';
import { PlusOutlined, ForwardOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './CSS/Contatti.css'; 
import { useAuth } from './AuthContext'

// definiamo come è composta una InfoRiga
interface InfoRiga {
  id: number;
  testo: string;
}

//righe fittizzie per riempire il sito al momento


function InfoManager() {

      const { isAdmin} = useAuth();
  // utiizzo della useState: questa riga sotto è una firma, tu con useState crei una variabile listaInfo di tipo InfoRiga[] inizializzatsa
  // con datiIniziali. In questo modo questa variabile mantiene i dati anche quando viene rieffettuato il render della funzione
  // altrimento a ogni render la variabile si resetterebbe.
  //  const [listaInfo, setListaInfo] = useState<InfoRiga[]>(datiIniziali);
      const [listaInfo, setListaInfo] = useState<InfoRiga[]>([]);

      // questo hook "useEffect" viene eseguito solo una volta ( vedi ultima riga)
      useEffect(() => {
        //funzione per caricare i dati
        const caricaDatiIniziali = async () => { // async sblocca la keyword await dentro la funzione 
          // QUI FAI LA TUA CHIAMATA HTTP
          const response = await fetch('http://localhost:3000/api/inizializzaInfo'); // mette in pausa questa funzione fino a che il fetch non è completo
          const datiDalServer = await response.json();
          console.log("ecco i dati " + datiDalServer);
          setListaInfo(datiDalServer);
        };

        caricaDatiIniziali(); // Esegui la funzione
      },[]); // <-- L'array [] vuoto dice a React: "Fallo solo 1 volta". se ci fosse una variabile verrebbe usato ogni volta che la variabile cambia
              // senza variabile viene usata ogni volta che si esegue una render

  // variabile booleana per far comparire il modulo di modifica e aggiunta
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // variabile booleana per far comparire il modulo di eliminazione
  const [ isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);


  // Form è di Ant design, così come l'hook Form.useForm(), il quale restituisce alla variabile form un ""oggetto"" di tipo
  // form, sul quale potrai usare metodi come .resetfileds etc...
  const [form] = Form.useForm();
  
  //costante che ricorda quale riga stiamo modificando, null significa che stiamo aggiungendo una riga
  const [editingItem, setEditingItem] = useState<InfoRiga | null>(null);

  
  
  /* ANALISI DELLA ARROW FUNCTION SOTTO*/
    /*
    const mostraModalAggiungi: Dichiari una variabile costante (il nome della tua funzione).
    =: Le assegni un valore.
    () => { ... }: Il valore è la funzione stessa.
    (): L'elenco dei parametri (in questo caso, nessuno).
    =>: La "freccia". Sostituisce la parola chiave function.
    { ... }: Il corpo (il codice) della funzione.
    */

    
  // per gestire il popup aggiungi 
  const mostraModalAggiungi = () => {
    setEditingItem(null); // il null indica che è una nuova riga
    form.resetFields();   // resetta quindi i campi del form (il form è lo stesso per modifica e aggiungi)
    setIsModalVisible(true); // così compare il modulo a schermo
  }; // le set implicano un render del componente, react le accumula e ne esegue uno
  
  //funzione che mostra il popup del form ma inizializzato con la riga da mofidicare
  const mostraModalModifica = (item: InfoRiga) => {
    setEditingItem(item); // gli dici quale riga devi modificare
    form.setFieldsValue({ testo: item.testo }); // riempi il form con i dati della riga
    setIsModalVisible(true); // lo rendi visibile
  };

  // fai il preset della variabile ItemToDelete e mostri il modal
  const mostraModalElimina = (id: number) => {
    setItemToDeleteId(id);      // Salva l'ID nel "cassetto"
    setIsDeleteModalVisible(true); // Apri il *secondo* popup
  };

  // funzione per chiudere il popup
  const chiudiModal = () => {
    setIsModalVisible(false); // lo nasconde
    form.resetFields(); // resetta il form anche se non serve
    setEditingItem(null); // resetti l'item da modificare (non credo serva)
  }; // esegue la render

  const chiudiModalElimina = () => {
    setItemToDeleteId(null);       // Svuota il "cassetto"
    setIsDeleteModalVisible(false); // Chiudi il *secondo* popup
  }; // esegue la render


  // funzione per modificare ListaInfo ( con l'apposita funzione setListaInfo)
  // la funzione onfinish di Form di Ant design è progettata per passare sempre un solo argomento
  // quindi facciamo l'impacchettamento di values in modo tale da poterne avere 1 o più
  const handleSalvaForm = async (values: { testo: string }) => { // la parola "testo" non è casuale, è legata al form
    try {
    if (editingItem) { // se null aggiungi riga altrimenti modifichi come in questo caso

      
        if (editingItem) {
        
          const riga = {
            id: editingItem.id,   // L'ID dell'item che stai modificando
            testo: values.testo // Il *nuovo* testo dal form
          };

          // Nuova implementazione (Sicura con Cookie HttpOnly)
          const response = await fetch(`http://localhost:3000/api/modificaInfo`, { 
              method: 'PUT',  
              headers: { 
                  'Content-Type': 'application/json' 
                  // L'header 'Authorization' viene rimosso
              }, 
              body: JSON.stringify(riga),
              credentials: 'include' // ✅ Dice al browser di inviare automaticamente il cookie admin_token
          });

          if (!response.ok) throw new Error('Modifica fallita (Verifica il server)');
        }
      //setListaInfo( (datiPrecedenti) => ... ); è la funzione esterna, tu passi a setListaInfo una arrowfunction
      // datiPrecedenti prende l'ultimo valore di ListaInfo
      // poi dentro abbiamo datiPrecedenti.map( (item) => è un modo di iterare sugli oggetti della mappa, l'oggetto su cui iteri è "item"
      // attenzione perchè .map è semplicemente un metodo degli array in javascript che permette di iterare sugli elementi dell'array.
      setListaInfo( (datiPrecedenti) => datiPrecedenti.map( (item) =>
          // Se l'ID corrisponde copi il l'iterno valore di item ma sovrascrivendo values, altrimenti lasci item normale
          // i tre puntini permettono di aprire un oggetto e ricopiare tutto quello che cera dentro, poi specifichi il campo testo sovrascrivendolo
          item.id === editingItem.id  ? { ...item, testo: values.testo } : item
        )
      );
    } else { //il form ti sta chiedendo di aggiungere una riga

    

      const testo = values.testo
      // Nuova implementazione (Sicura con Cookie HttpOnly)
      const response = await fetch(`http://localhost:3000/api/aggiungiRiga`, { 
          method: 'POST',  
          headers: { 
              'Content-Type': 'application/json' 
              // L'header 'Authorization' viene rimosso
          }, 
          body: JSON.stringify({testo}),
          credentials: 'include' // ✅ Dice al browser di inviare automaticamente il cookie admin_token
      });

      if (!response.ok) throw new Error('Salvataggio fallito (Verifica il server)');  
       
      
      const nuovaRigaDalServer: InfoRiga = await response.json();

        setListaInfo( (datiPrecedenti) => [...datiPrecedenti, nuovaRigaDalServer] );
        

      };

    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      alert("Errore durante il salvataggio dei dati.");
    }
    chiudiModal(); // Chiudi il popup in entrambi i casi. Ricordiamo che questa funzione handleSaveForm viene eseguita dopo una onfinish
  };


  const handleEseguiEliminazione = async () => {
    try {

      if (itemToDeleteId === null) return; // la variabile viene riempita da mostraModalElimina eh ricorda

        // Nuova implementazione (Sicura con Cookie HttpOnly)
      const response = await fetch(`http://localhost:3000/api/eliminaRiga`, { 
          method: 'POST',  
          headers: {  
              'Content-Type': 'application/json' 
              // L'header 'Authorization' viene rimosso
          }, 
          body: JSON.stringify({id: itemToDeleteId}),
          credentials: 'include' // ✅ Dice al browser di inviare automaticamente il cookie admin_token
      });

if (!response.ok) throw new Error('Salvataggio fallito (Verifica il server)');
        setListaInfo( (datiPrecedenti) => datiPrecedenti.filter( (item) => item.id !== itemToDeleteId ) );

      } catch (error) {
        console.error("Errore nel salvataggio:", error);
        alert("Errore durante il salvataggio dei dati.");
      }
    chiudiModalElimina(); // Chiude il popup di eliminazione
  };



  return (
    <div className="informazioni">
      
     <h1 style={{ fontSize: '3em', margin: '0 0 0.67em 0' }}>Contatti & Info</h1>
      {/* List è un componente di Ant design in caso ci siano domande per i metodi */}
      <List className="info-lista-custom" dataSource={listaInfo}
        renderItem={(item) => ( // itera il codice html con i campi di item, per ogni item in dataSource

          <div className="info-riga">

            {/* Contenuto (Icona + Testo) */}
            <div className="info-riga-contenuto">
              <ForwardOutlined />
              <span> {item.testo}</span>
            </div>

            {/* Bottoni Admin (Modifica / Elimina) */}
            {/* 'Space' di Antd è perfetto per spaziare i bottoni */}
             {isAdmin && ( <Space className="info-riga-bottoni">
              <Button icon={<EditOutlined />} onClick={() => mostraModalModifica(item)}/>
              <Button type="primary" danger /* lo fa rosso*/ icon={<DeleteOutlined />} onClick={() => mostraModalElimina(item.id)} />
            </Space> )}
          </div>
        )}
      /> {/* di list */}
      
      <br /> {/* a capo, linebreak, agiunge una riga vuota */}

      {/* Bottone aggiungi, per aggiungere una*/}
      {isAdmin && (<Button type="primary" icon={<PlusOutlined />} /* aggiunge il simbolo + */ onClick={mostraModalAggiungi}>
        Aggiungi Informazione
      </Button>)}

      {/* Parte dei pop up di modifica e aggiunta, il titolo del popup cambia in base a editingItem*/}
      <Modal title={editingItem ? "Modifica riga" : "Aggiungi nuova riga"} open={isModalVisible} onCancel={chiudiModal} footer={null} >
        <Form form={form} layout="vertical" onFinish={handleSalvaForm}>
          <Form.Item
            name="testo" // non è casuale, è legata alla variabile della funzione handleSalvaForm
            label="Testo della riga" rules={[{ required: true, message: 'Il testo è obbligatorio' }]}>

            <Input placeholder="Es: mail: info@bb.com" />

          </Form.Item>

          {/* quando premi il pulsante submit, viene chiama la onFinish*/}
          <Button type="primary" htmlType="submit"> {editingItem ? "Salva Modifiche" : "Salva Riga"} </Button>
        </Form>
      </Modal>


      {/* Parte di pop up per l'eliminazione di una riga */}
      <Modal title="Conferma Eliminazione" open={isDeleteModalVisible} onCancel={chiudiModalElimina} onOk={handleEseguiEliminazione} okText="Elimina" okType="danger" cancelText="Annulla" >
        <p>Sei sicuro di voler eliminare questa riga?</p>
      </Modal>

    </div>
  );
}

export default InfoManager;