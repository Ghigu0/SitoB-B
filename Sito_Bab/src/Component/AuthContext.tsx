import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, FC } from 'react'; // Aggiungi qui anche FC se lo usi (React.FC)


// contratto dei dati che saranno condivisi nel Contentext
interface AuthContextType {
  isAdmin: boolean; // variabili di stato leggibili
  login: () => void; // ti dice che ci dovrà essere una funzione login 
  logout: () => void; // ti dice che ci dovrà essere una funziona logout
}

//esegue l'operazione fondamentale di creare lo spazio dove il tuo stato globale di autenticazione vivrà e sarà condiviso.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// l'authProvide si aspetta di ricevere
// ti dice di fare tipo 
/* <AuthProvider>
    <AppContent /> 
</AuthProvider> */

interface AuthProviderProps {
  children: ReactNode;
}

// export: il componente può essere utilizzato in altri file 
// React.FC<AuthProviderProps> dice che "questa è una funzione che crea un componente React."
// specificare AuthProviderProps dice che il componente accetta solo le propietà definite nell'interfaccia Auth...
// children è il componente che metterai dentro il tag Auth
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

  const [isAdmin, setIsAdmin] = useState(false);
 
  // Implementazione delle funzioni che verranno usate in App
  const login = () => {
    setIsAdmin(true);
  };

  const logout = () => {
    setIsAdmin(false);
    
    // fai una chiamata http per far rimuovere il cookie
  };
  
  // Logica per caricare lo stato al refresh
  /*
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken'); // così se eri admin e refereshi la pagina rimani
    if (savedToken) {
        setIsAdmin(true);
    }
  }, []);
dopo la logica cookie non serve più*/
  // 4. Ritorna il Provider con i valori da condividere
  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// // dentro ai componenti usi questa funzione per riprenderti il contesto 
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
};