import os
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.mysql import LONGTEXT


# Credenziali di accesso al container Docker (definite nel comando docker run)
MYSQL_USER = "root"
MYSQL_PASSWORD = "segreto"
MYSQL_HOST = "127.0.0.1"  
MYSQL_PORT = "3306"      
MYSQL_DB = "bnb_db"     

#crea una stringa di testo formattata che segue uno standard universale chiamato URI di Connessione al Database.
#serve come infirizzo e credenziali complete per dire alla libreria SQLAlchemy dove e come trovare il server MYSQL
DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"

#L'engine serve per ottimizzazioni tipo se mandi 100 richieste lui le accumula e quelle cagate li
# create_engine è una funzione già definita da sqlalchemy e noi la stiamo solo usando.
Engine = create_engine( DATABASE_URL, echo=True)
#echo=true serve solo per far si che quando python manda delle richieste al DB queste vengono stampate 
#nel terminale e mostrate ( tipo INSERT INTO informazioni (Titolo, Descrizione) VALUES ('...', '...') )

#La variabile Base ti serve come modello genitore obbligatorio per ogni singola tabella (modello) che aggiungerai 
# al tuo progetto.
Base = declarative_base()
#Definizione dei Modelli: Tutte le tue tabelle (Informazioni, Galleria, Utenti) dovranno ereditare da Base.
#Esegue in automatico alcune operazioni come CREATE TABLE Informazioni(..); etc

# la variabile SessionLocal è il modo in cui l'applicazione creerà e gestire le connessioni quando ne avrà bisogno
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=Engine)
#esegue le operazioni come Select, Insert, Update
#autocommit=False  Richiede che tu chiami esplicitamente db.commit() dopo aver eseguito un'operazione di scrittura 
    #(INSERT, UPDATE, DELETE). Se non lo fai, le modifiche non verranno salvate. Questo previene salvataggi accidentali.
#autoflush=False Controlla quando le modifiche in memoria (gli oggetti Python modificati) vengono scritte temporaneamente in SQL. 
    #Lasciarlo a False dà a SQLAlchemy maggiore controllo sull'efficienza.

# ==============================================================================
# Classi per comunicare in lettura e scrittura con il DB
# ==============================================================================

class InfoRigaDB(Base):
    """
    Rappresenta una singola riga di informazione (la tua listaInfo)
    nel database. Questo definisce lo schema della tabella 'informazioni'.
    """
    __tablename__ = "informazioni"

    # ID univoco e chiave primaria (autoincrementale)
    id = Column(Integer, primary_key=True, index=True)
    titolo = Column(String(255), index=True, nullable=False)
    descrizione = Column(Text, nullable=False) # Usiamo 'Text' per testi potenzialmente lunghi
    posizione = Column(Integer, nullable=False) # Il numero di posizione per l'ordinamento

    # Metodo opzionale per una rappresentazione leggibile dell'oggetto
    def __repr__(self):
        return f"<InfoRigaDB(id={self.id}, titolo='{self.titolo}')>"
    
class GalleriaDB(Base):
    """
    Rappresenta una singola foto nella Galleria del sito.
    Contiene il dato Base64 dell'immagine.
    """
    __tablename__ = "galleria"

    id = Column(Integer, primary_key=True, index=True)
    src = Column(LONGTEXT, nullable=False)
    alt = Column(String(255), index=True, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    
    def __repr__(self):
        return f"<GalleriaDB(id={self.id}, alt='{self.alt}')>"
    
class ContenutiSitoDB(Base):
    """
    Rappresenta un elemento di contenuto del sito (es. Benvenuti, Servizi).
    Corrisponde alla logica del tuo ContentManager.tsx.
    """
    __tablename__ = "contenuti_sito"

    id = Column(Integer, primary_key=True, index=True)
    titolo = Column(String(255), index=True, nullable=False)
    descrizione = Column(Text, nullable=False)
    imageUrl = Column(LONGTEXT, nullable=True)  # <- qui il cambio importante
    # Metodo opzionale per una rappresentazione leggibile dell'oggetto
    def __repr__(self):
        return f"<ContenutiSitoDB(id={self.id}, titolo='{self.titolo}')>"

# ==============================================================================
# 3. Funzione di Utilità
# ==============================================================================

def get_db():
    """
    Funzione di utilità per FastAPI che ottiene una sessione DB e la chiude dopo l'uso.
    Questo è un pattern essenziale (Dependency Injection) in FastAPI/SQLAlchemy.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_db_and_tables():
    """
    Crea le tabelle nel database MySQL se non esistono.
    Questo comando guarda il catalogo 'Base' e crea lo schema.
    """
    # 🛑 QUESTO È IL COMANDO CHE CREA LE TABELLE 🛑
    Base.metadata.create_all(bind=Engine)
    print("Database: Tabelle create o già esistenti.")
