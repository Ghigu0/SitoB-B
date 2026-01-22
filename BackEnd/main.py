from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware #per i permessi CORS
from routers import Info_router
from routers import Galleria_router
from routers import ContentManager_router
from routers import Login_router
from routers.database import create_db_and_tables 


app = FastAPI(); #crei una istanza FastApi

#dichiari una lista e le assegni un valore. questa lista verrà usata per sapere chi sono i siti ai quali dare i dati
create_db_and_tables()
# 3. AGGIUNGI IL MIDDLEWARE (il "permesso" CORS)
# Configurazione CORS
origins = [
    "http://localhost",       # Permette l'accesso da localhost
    "http://localhost:3000",  # Sostituisci con la porta del tuo frontend React
    "http://127.0.0.1",
    # Aggiungi qui la porta esatta da cui esegui React (es. 5173, 8080, ecc.)
    "http://localhost:5173",  
    "http://localhost:5174",
]

# Questo aggiungerà l'header 'Access-Control-Allow-Origin'
app.add_middleware(
    CORSMiddleware, #installiamo il middleware CORSMiddleware e gli argomenti successivi sono parametri di configurazione
    allow_origins=origins, #whitelist dei siti
    allow_credentials=True,
    allow_methods=["*"], # Permetti tutti i metodi (GET, POST, DELETE...)
    allow_headers=["*"], # Permetti tutti gli header
)

#router per sezione Contatti & Info: comprende /api/inizializzaInfo /api/modificaInfo /api/aggiungiRiga /eliminaRiga
app.include_router(Info_router.router)
app.include_router(Galleria_router.router)
app.include_router(ContentManager_router.router)
app.include_router(Login_router.router)



# Questo blocco serve solo se avvii il file con 'python main.py'
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
