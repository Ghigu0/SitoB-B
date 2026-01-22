import base64
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
import config
from .Login_router import FAKE_ADMIN_TOKEN, get_admin_token_from_cookie
from .database import InfoRigaDB, GalleriaDB, ContenutiSitoDB, SessionLocal
from sqlalchemy import func


BASE_DIR = Path(__file__).resolve().parent.parent
# Se i router sono in una sottocartella, potresti dover aggiungere .parent
# Esempio: BASE_DIR = Path(__file__).resolve().parent.parent

router = APIRouter(
    prefix="/api", #aggiunge a ogni rout il prefisso /api
    tags=["Img"] #serve per la documentazione che si crea in automatico
)

def carica_immagine_base64(percorso_file):
    try:
        with open(percorso_file, "rb") as image_file:
            # Legge i byte, li codifica in base64 e li trasforma in stringa
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            # Aggiunge il prefisso necessario per il browser
            return f"data:image/jpg;base64,{encoded_string}"
    except FileNotFoundError:
        return "impossibile caricare l'immagine" # O gestisci l'errore come vuoi
    
#ricorda: l'obiettivo è mandare a Galleria.tsx un array di questo oggetto
# id: int
# src: str
# alt: str
# width: int
# height: int



#CARICAMENTO INIZIALE DELLE IMMAGINI
@router.get("/inizializzaImg")
async def inizializza_galleria():
    db = SessionLocal()
    try:
        immagini = db.query(GalleriaDB).all()
        result = [
            {
            "id": img.id,
            "src": img.src,  # già in formato base64
            "alt": getattr(img, "descrizione", img.alt),
            "width": 300,    # valori di default
            "height": 200
            }
            for img in immagini
        ]
        return result
    finally:
        db.close()

@router.put("/modificaImg")
async def aggiungi_galleria(req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="JSON malformato")

    token = get_admin_token_from_cookie(req)
    if token != FAKE_ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Autorizzazione negata. Token non valido o scaduto.")

    if not data:
        raise HTTPException(status_code=400, detail="Il body della richiesta è vuoto.")

    db = SessionLocal()
    try:
        # Creiamo l'oggetto usando i nomi corretti dei campi
        nuova_img = GalleriaDB(
            src=data["src"],  # il campo corretto nella tabella
            alt=data.get("alt", ""),
            width=data.get("width", 300),
            height=data.get("height", 200)
        )
        db.add(nuova_img)
        db.commit()
        db.refresh(nuova_img)  # importante per avere l'id generato

        # restituiamo l'oggetto completo incluso l'id
        return {
            "id": nuova_img.id,
            "src": nuova_img.src,
            "alt": nuova_img.alt,
            "width": nuova_img.width,
            "height": nuova_img.height
        }

    finally:
        db.close()


   

@router.post("/eliminaImg")
async def elimina_galleria(req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="JSON malformato")

    token = get_admin_token_from_cookie(req)
    if token != FAKE_ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Autorizzazione negata. Token non valido o scaduto.")

    img_id = data.get("id")
    if not img_id:
        raise HTTPException(status_code=400, detail="ID mancante")

    db = SessionLocal()
    try:
        img = db.query(GalleriaDB).filter(GalleriaDB.id == img_id).first()
        if not img:
            raise HTTPException(status_code=404, detail="Immagine non trovata")

        db.delete(img)
        db.commit()

        return {"message": "Immagine eliminata con successo", "id": img_id}
    finally:
        db.close()
