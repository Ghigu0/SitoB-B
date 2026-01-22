from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
import config
from .Login_router import FAKE_ADMIN_TOKEN, get_admin_token_from_cookie
from .database import get_db, Session 
from .database import InfoRigaDB, GalleriaDB, ContenutiSitoDB, SessionLocal
from sqlalchemy import func


router = APIRouter(
    prefix="/api", #aggiunge a ogni rout il prefisso /api
    tags=["Info"] #serve per la documentazione che si crea in automatico
)
#un array con dei dict, quelli tra {} che definisce al suo interno coppie chiave: valore


#CARICAMENTO INIZIALE DEI DATI
@router.get("/inizializzaInfo") #collega quesa funzione all'oggetto app e rispondi solo alle richieste http a questo percorso
async def inizializza_struttura():
    db = SessionLocal()
    # 1. Controlla il numero di righe nella tabella
    try:
        
        
        items = db.query(InfoRigaDB).order_by(InfoRigaDB.posizione).all()

        # CONVERSIONE → quello che si aspetta il frontend
        response = [
            {
                "id": item.id,
                "testo": f" {item.descrizione}"
            }
            for item in items
        ]

        return response

    finally:
        db.close()

  

#MODIFICARE LA LISTA DELLE INFORMAZIONI
@router.put("/modificaInfo")
async def modifica_riga(req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="JSON malformato")


    token = get_admin_token_from_cookie(req)

    if token != FAKE_ADMIN_TOKEN:
        raise HTTPException(
            status_code=403, 
            detail="Autorizzazione negata. Token non valido o scaduto."
        )

    item_id = data.get('id')
    item_testo = data.get('testo')

    db = SessionLocal()
    try:
            # Trova la riga da modificare
            item = db.query(InfoRigaDB).filter(InfoRigaDB.id == item_id).first()
            if item is None:
                raise HTTPException(status_code=404, detail="Riga non trovata")
            
            # Aggiorna i campi nel database
            item.Titolo = item_testo
            item.Descrizione = item_testo  # se vuoi mantenere la stessa logica del seeding
            db.commit()
            db.refresh(item)  # Aggiorna l'oggetto con i valori del DB
            
            # Restituisci l'oggetto modificato al frontend
            return {
                "id": item.id,
                "testo": item.Titolo
            }

    finally:
        db.close()


@router.post("/aggiungiRiga")
async def aggiungi_riga(req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="JSON malformato")

    token = get_admin_token_from_cookie(req)

    # 3. Confronta con il token amministratore salvato
    # NOTA: In un'applicazione reale, qui faresti una validazione JWT,
    # ma per il tuo caso, basta confrontare la stringa salvata.
    if token != FAKE_ADMIN_TOKEN:
        raise HTTPException( #interrompe il codice
            status_code=403, 
            detail="Autorizzazione negata. Token non valido o scaduto."
        )
    
    
    item_testo = data.get("testo")

    if not item_testo:
        raise HTTPException(status_code=400, detail="Campo 'testo' mancante")

    db = SessionLocal()

    try:
        # Trova la posizione/ID successiva
        max_pos = db.query(func.max(InfoRigaDB.Posizione)).scalar() or 0
        nuova_posizione = max_pos + 1

        # Crea nuovo record
        db_item = InfoRigaDB(
            Titolo=item_testo,
            Descrizione=item_testo,
            Posizione=nuova_posizione
        )

        db.add(db_item)
        db.commit()
        db.refresh(db_item)   # Ottiene l'id assegnato dal db

        print(f"Aggiunta riga {db_item.id}: {item_testo}")

        # 🔥 Restituiamo ciò che il frontend si aspetta
        return {
            "id": db_item.id,
            "testo": item_testo
        }

    finally:
        db.close()
    



@router.post("/eliminaRiga")
async def elimina_riga(req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="JSON malformato")


    token = get_admin_token_from_cookie(req)
    if token != FAKE_ADMIN_TOKEN:
        raise HTTPException(
            status_code=403,
            detail="Autorizzazione negata. Token non valido o scaduto."
        )

    item_id = data.get("id")  # Aspettiamo un JSON { "id": ... }

    db = SessionLocal()
    try:
        # Trova la riga da eliminare
        item = db.query(InfoRigaDB).filter(InfoRigaDB.id == item_id).first()
        if item is None:
            raise HTTPException(status_code=404, detail="Riga non trovata")

        db.delete(item)
        db.commit()

        print(f"Eliminata riga {item_id}")
        return {"id": item_id, "status": "eliminata"}

    finally:
        db.close()

