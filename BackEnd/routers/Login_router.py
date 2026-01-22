from fastapi import APIRouter, Request, HTTPException, Response
from datetime import datetime
import config
router = APIRouter(
    prefix="/api", #aggiunge a ogni rout il prefisso /api
    tags=["Login"] #serve per la documentazione che si crea in automatico
)


    
FAKE_ADMIN_TOKEN = "fake-token-jwt-super-sicuro-per-admin"

def get_admin_token_from_cookie(request: Request):
    """
    Estrae il token dal cookie 'admin_token' e verifica la sua validità.
    Se non è valido, solleva un'eccezione 401/403 che interrompe l'esecuzione dell'endpoint.
    """
    token = request.cookies.get("admin_token")
    
    # 1. Verifica la presenza del cookie
    if not token:
        raise HTTPException(status_code=401, detail="Non autenticato: token cookie mancante")

    # 2. Verifica la validità (SIMULAZIONE)
    # In una vera app, qui decodificheresti il JWT, verificando la firma e la scadenza.
    if token != FAKE_ADMIN_TOKEN:
        # Se il token è presente ma non valido (es. rubato o modificato)
        raise HTTPException(status_code=403, detail="Autorizzazione negata: token non valido.")

    # Se la verifica ha successo, restituisce il token
    return token


@router.put("/Login")
async def Login(req: Request, response: Response): 
    # La Response è un oggetto che usiamo per impostare l'intestazione Set-Cookie

    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="JSON malformato")

    username = data.get('username')
    password = data.get('password')
    
    # Verifica credenziali (Simulazione)
    if username == "admin" and password == "admin":
        
        # 1. IMPOSTA IL COOKIE
        response.set_cookie(
            key="admin_token",           # Il nome del cookie (lo stesso che verrà inviato dal browser)
            value=FAKE_ADMIN_TOKEN,      # Il valore del token JWT (o un ID di sessione)
            path="/",                    # Il cookie è valido per tutto il dominio
            httponly=True,               # 🛑 CRUCIALE: Non leggibile da JavaScript (Protezione XSS)
            secure=False,                # 🛑 CRUCIALE PER LOCALE: False per HTTP, True per HTTPS di produzione
            #samesite="lax"               # Contribuisce a prevenire attacchi CSRF lo mettiamo dopo perchè richiedere che il sito sia sercure
        )
        
        # 2. RISPONDI AL CLIENT
        # Non devi restituire il token nel body!
        # Il browser ha già gestito il Set-Cookie in background.
        return {"message": "Login successful"}
    
    else: 
        # Risposta di errore in caso di credenziali non valide
        raise HTTPException(
            status_code=401, 
            detail="Credenziali non valide."
        )
