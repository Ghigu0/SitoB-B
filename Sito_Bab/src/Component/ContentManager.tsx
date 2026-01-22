import React, { useState, useEffect } from 'react';

// 1. IMPORTA 'EditOutlined'
import { List, Button, Modal, Form, Input, Upload, Image, Space } from 'antd'; 
import { PlusOutlined, UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import './CSS/ContentManager.css'; 
import { useAuth } from './AuthContext'

//firma di un componente
interface ItemData {
  id: number;
  titolo: string;
  descrizione: string;
  imageUrl: string; 
}

//funzione che decodifica un immagine in url come richiesto dal tag img ( vedi Galleria.tsx)
const getBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });



function ContentManager() {
  
  const { isAdmin} = useAuth();
  // vola via dopo useEffect
  const [listaDati, setListaDati] = useState<ItemData[]>([]);

  useEffect(() => {
          //funzione per caricare i dati
          const caricaDatiIniziali = async () => { // async sblocca la keyword await dentro la funzione 
            // QUI FAI LA TUA CHIAMATA HTTP
            const response = await fetch('http://localhost:3000/api/inizializzaContent'); // mette in pausa questa funzione fino a che il fetch non è completo
            const datiDalServer = await response.json();
            // console.log("ecco i dati " + datiDalServer); <--- Vecchio log che convertiva in stringa
            console.log("Ecco i dati ricevuti (Array di oggetti):", datiDalServer); // <--- Corretto per vedere l'array
            setListaDati(datiDalServer);
          };
  
          caricaDatiIniziali(); // Esegui la funzione
        },[]); // <-- L'array [] vuoto dice a React: "Fallo solo 1 volta". se ci fosse una variabile verrebbe usato ogni volta che la variabile cambia
                // senza variabile viene usata ogni volta che si esegue una render
  


  // per il modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // per l'elemento da modificare
  const [elementoInModifica, setElementoInModifica] = useState<ItemData | null>(null);

  // 🛑 VARIABILI PER IL MODAL DI CONFERMA ELIMINAZIONE 🛑
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [form] = Form.useForm();
  
  //mostra il modal in modalità aggiungi
  const mostraModalAggiungi = () => {
    setElementoInModifica(null); 
    setIsModalVisible(true);
  };

  // prepara il form per la modifica ( riempendolo con i campi già visibili)
  const mostraModalModifica = (elemento: ItemData) => {
    setElementoInModifica(elemento); 
    form.setFieldsValue({
      titolo: elemento.titolo,
      descrizione: elemento.descrizione,
      // non mettiamo l'immagine perchè ci pensa il tag upload
    });
    setIsModalVisible(true);
  };
  
  // per chiudere il modal
  const chiudiModal = () => {
    setIsModalVisible(false);
    setElementoInModifica(null);
    form.resetFields(); 
  };

  // funzione per aggiungere O modificare un elemento ( async per via della codifica 64)
  // values è l'oggetto generato dal form di ant design prendendo i name che hai dato ai Form.Item.
  const handleSalvaElemento = async (values: any) => {
    try {

      let imageUrlFinale = '';

      // nel caso in cui tu stia aggiungendo una immagine, values.immagine contiene appunto una immagine
      // rispecchia anche il caso in cui modificando un campo, aggiorni l'immagine e ne carichi una nuova
      const fileCaricato = values.immagine && values.immagine[0] && values.immagine[0].originFileObj;

      if (fileCaricato) {
        imageUrlFinale = await getBase64(fileCaricato);
      } else if (elementoInModifica) { // in modifica dove non modifichi la foto però
        imageUrlFinale = elementoInModifica.imageUrl;
      }

      
      if (elementoInModifica) {
        // invio al backend
        const Contenuto = {
            // L'ID è cruciale per il backend per sapere quale record aggiornare
            id: elementoInModifica.id,
            titolo: values.titolo,
            descrizione: values.descrizione,
            imageUrl: imageUrlFinale // L'URL in base64 calcolato
        }

        const response = await fetch(`http://localhost:3000/api/modificaContent`, { 
          method: 'PUT',  
          headers: { 
              'Content-Type': 'application/json' 
              // L'header 'Authorization' viene rimosso
          }, 
          body: JSON.stringify(Contenuto),
          credentials: 'include' // ✅ Dice al browser di inviare automaticamente il cookie admin_token
        });

if (!response.ok) throw new Error('Modifica fallita (Verifica il server)');
        
        setListaDati((prev) => 
          prev.map((item) => 
            item.id === elementoInModifica.id 
              ? { ...item, titolo: values.titolo, descrizione: values.descrizione, imageUrl: imageUrlFinale } : item
          )
        );

        
      } else { // caso aggiungi 
       
        const Contenuto = {
        titolo: values.titolo,
        descrizione: values.descrizione,
        imageUrl: imageUrlFinale
        };

        const response = await fetch(`http://localhost:3000/api/aggiungiContent`, { 
            method: 'PUT',  
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(Contenuto),
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Aggiunta fallita (Verifica il server)');
        const nuovoElemento = await response.json(); // backend restituisce l'id generato

        setListaDati((prev) => [...prev, nuovoElemento]);
        
      }
      chiudiModal();

    } catch (error) {
      console.error('Errore:', error);
      alert('Si è verificato un errore.');
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };
  
  const handleEliminaElemento = (idDaEliminare: number) => {
    // Memorizza l'ID e mostra il modal Ant Design
    setIdToDelete(idDaEliminare);
    setIsDeleteModalVisible(true);
  };


  const handleConfermaEliminazione = async () => {
    if (idToDelete === null) return;

    try {
        // L'API DELETE necessita dell'ID, lo inviamo come oggetto { id: ... }
        const bodyToSend = { id: idToDelete }; 

        const response = await fetch(`http://localhost:3000/api/eliminaContent`, { 
          method: 'POST',  
          headers: { 
              'Content-Type': 'application/json' 
              // L'header 'Authorization' viene rimosso
          }, 
          body: JSON.stringify(bodyToSend),
          credentials: 'include' // ✅ Dice al browser di inviare automaticamente il cookie admin_token
      });

if (!response.ok) throw new Error('Eliminazione fallita (Verifica il server)');
        
        if (!response.ok) throw new Error('Eliminazione fallita');
        
        // Aggiorna lo stato locale solo dopo il successo del backend
        setListaDati((prev) => prev.filter((item) => item.id !== idToDelete));

    } catch (error) {
        console.error('Errore durante l\'eliminazione:', error);
        alert('Si è verificato un errore durante l\'eliminazione. Riprova.');
    } finally {
        // Chiudi il modal e resetta l'ID in ogni caso
        setIsDeleteModalVisible(false);
        setIdToDelete(null);
    }
  };


  return (
    
    <div style={{ width: '90%', margin: '40px auto', maxWidth: '1000px' }}>
    <h1 style={{ textAlign: 'center' }}>I nostri consigli</h1>
    <br ></br>
      <List
        itemLayout="horizontal"
        dataSource={listaDati}
        renderItem={(item) => (
          <List.Item
            style={{ padding: '20px', background: '#eeecf4ff', marginBottom: '10px' }}
            
            // 5. ACTIONS VERTICALI
            // Usiamo un solo elemento nella lista actions che contiene uno Space verticale
            actions={[
              
                <Space direction="vertical" size="small">
                  {isAdmin && (<Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleEliminaElemento(item.id)}
                  block // Rende il bottone largo quanto il contenitore
                >
                  Elimina
                </Button> )}

                 {isAdmin && (<Button
                  type="default" // Stile diverso per distinguerlo (o primary ghost)
                  icon={<EditOutlined />}
                  onClick={() => mostraModalModifica(item)}
                  block
                  style={{ borderColor: '#1890ff', color: '#1890ff' }}
                >
                  Modifica
                </Button> )}
              </Space> 
            ]}
          >
            <List.Item.Meta
              avatar={
                <Image
                  className="content-manager-image"
                  src={item.imageUrl}
                  alt={item.titolo}
                  width={150} // Aggiunto un width fisso per ordine visivo
                />
              }
              title={<span style={{ fontSize: '1.5rem' }}>{item.titolo}</span>}
              description={<span style={{ fontSize: '1.1rem' }}>{item.descrizione}</span>}
            />
          </List.Item>
        )}
      />

      <div style={{ textAlign: 'center' }}> 
         {isAdmin && ( <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={mostraModalAggiungi}
          style={{ marginBottom: '60px', marginTop: '15px' }}
        >
          Aggiungi Nuovo Elemento
        </Button> )}
      </div>

      {/* Modale Unico per Aggiunta e Modifica */}
      <Modal 
        title={elementoInModifica ? "Modifica elemento" : "Aggiungi nuovo elemento"} 
        visible={isModalVisible} 
        onCancel={chiudiModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSalvaElemento}
        >
          <Form.Item name="titolo" label="Titolo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          <Form.Item name="descrizione" label="Descrizione" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>

          {/* Mostra l'immagine attuale se siamo in modifica */}
          {elementoInModifica && (
            <div style={{ marginBottom: 10 }}>
              <p>Immagine attuale:</p>
              <Image src={elementoInModifica.imageUrl} width={100} />
            </div>
          )}

          <Form.Item
            name="immagine"
            label={elementoInModifica ? "Cambia Immagine" : "Immagine"}
            valuePropName="fileList"
            getValueFromEvent={normFile}
            // 6. VALIDAZIONE CONDIZIONALE: Obbligatoria solo se NON stiamo modificando
            rules={[{ required: !elementoInModifica, message: 'L\'immagine è obbligatoria per i nuovi elementi' }]}
          >
            <Upload
              listType="picture"
              maxCount={1}
              accept="image/png, image/jpeg"
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Seleziona File</Button>
            </Upload>
          </Form.Item>
          
          <Button type="primary" htmlType="submit" block>
            {elementoInModifica ? "Salva Modifiche" : "Crea Elemento"}
          </Button>
        </Form>
      </Modal>

      
      <Modal
        title="Conferma Eliminazione"
        visible={isDeleteModalVisible}
        onOk={handleConfermaEliminazione} // Esegue la logica di eliminazione API/stato
        onCancel={() => { setIsDeleteModalVisible(false); setIdToDelete(null); }} // Chiude il modal senza agire
        okText="Elimina"
        cancelText="Annulla"
        okType="danger" // Bottone rosso per l'azione distruttiva
        destroyOnClose
      >
        <p>Sei sicuro di voler eliminare questo elemento in modo permanente? Questa azione è irreversibile.</p>
        
      
      </Modal>
    </div>
  );
}

export default ContentManager;