import React, { useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from './AuthContext'
// Definiamo le props se volessimo passare il colore da fuori, 
// per ora gestiamo tutto qui per semplicità.



function Login() {
  
  const { isAdmin, login, logout } = useAuth();
  // Stato per gestire la visibilità del modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Stato locale per sapere se siamo loggati (solo per effetto visivo pulsante, poi lo gestiremo meglio)
  
  // per il messaggio di errore quando inserisci le credenziali sbagliate 
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [form] = Form.useForm();

  // --- STILI PERSONALIZZATI ---
  // Qui puoi cambiare il colore del pulsante per farlo stare bene sulla foto
  const buttonStyle: React.CSSProperties = {
    position: 'fixed', // Lo stacca dal flusso normale per metterlo dove vogliamo
    top: '40px',          // Distanza dall'alto
    right: '40px',        // Distanza da destra
    zIndex: 1000,         // Si assicura che stia SOPRA la foto e non sotto
    
    // --- MODIFICHE PER INGRANDIRE IL PULSANTE ---
    padding: '15px 25px', // Aumenta lo spazio interno (padding verticale e orizzontale)
    fontSize: '15px',     // Aumenta la dimensione del testo e, di conseguenza, l'icona
    height: 'auto',       // Rimuove l'altezza fissa di Ant Design
    // ---------------
    // MODIFICA QUI I COLORI
    backgroundColor: isAdmin ? '#dc3b3bff' : '#6f4703ff', // Rosso se logout, Arancione Oro se login
    borderColor: isAdmin? '#9f0c0cff' : '#d5d5d5ff',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)' // Un'ombra per farlo risaltare sulla foto
  };

  const mostraModal = () => {
    setIsModalVisible(true);
  };

  const chiudiModal = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

 const handleLogin = async (values: any) => {
    console.log("Tentativo di login con:", values);

    setErrorMessage(null);

    // --- LA TUA LOGICA API QUI ---
    const credenziali = { username: values.username, password: values.password };
    let loginSuccessful = false;
    let receivedToken = null;

    try {
        
      const response = await fetch(`http://localhost:3000/api/Login`, { 
            method: 'PUT', // Tipicamente è POST, non PUT, per il login
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(credenziali), 
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            loginSuccessful = true;
          
        } else {
            message.error(data.message || 'Username o password errati');
        }

        // 2. CHIAMA LA FUNZIONE DEL CONTEXT solo in caso di successo
    if (loginSuccessful ) {
        message.success('Login effettuato con successo!');
        login(); 
    
        chiudiModal();
    } else {
        setErrorMessage("Username o password non validi");
      }

    } catch (error) {
        message.error('Impossibile connettersi al server.');
         setErrorMessage("Impossibile connettersi al BackEnd");
    }
  }

 const handleLogout = () => {
    // 3. CHIAMA LA FUNZIONE DEL CONTEXT
    
    logout(); // 👈 Chiama la funzione 'logout' del Context
    
    message.info('Logout effettuato');
    // Rimuovi setIsLoggedIn(false) - lo fa già il Context!
  };

  return (
    <>
      {/* IL PULSANTE "FLUTTUANTE" IN ALTO A DESTRA */}
      {!isAdmin ? (
        <Button 
            type="primary" 
            shape="round" 
            icon={<LoginOutlined />} 
            style={buttonStyle}
            onClick={mostraModal}
        >
            Login
        </Button>
      ) : (
        <Button 
            type="primary" 
            shape="round" 
            icon={<LogoutOutlined />} 
            style={buttonStyle}
            onClick={handleLogout}
        >
            Esci
        </Button>
      )}

      {/* IL MODAL DI LOGIN */}
      <Modal 
        title="Accesso Amministratore" 
        open={isModalVisible} 
        onCancel={chiudiModal}
        footer={null} // Nascondiamo i bottoni di default del modal per usare quelli del form
      >

        {errorMessage && (
            <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold', marginBottom: '15px' }}>
                {errorMessage}
            </p>
        )}

        <Form
          form={form}
          name="login_form"
          className="login-form"
          onFinish={handleLogin}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Inserisci il tuo username!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Inserisci la tua password!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" block>
              Accedi
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Login;