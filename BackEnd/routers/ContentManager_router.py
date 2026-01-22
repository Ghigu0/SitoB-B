import base64
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException, Response
import config
from .Login_router import FAKE_ADMIN_TOKEN, get_admin_token_from_cookie
from .database import InfoRigaDB, GalleriaDB, ContenutiSitoDB, SessionLocal
from sqlalchemy import func

Content = []
BASE_DIR = Path(__file__).resolve().parent.parent
# Se i router sono in una sottocartella, potresti dover aggiungere .parent
# Esempio: BASE_DIR = Path(__file__).resolve().parent.parent

router = APIRouter(
    prefix="/api", #aggiunge a ogni rout il prefisso /api
    tags=["Content"] #serve per la documentazione che si crea in automatico
)

    
# formato dati
# id: number;
# titolo: string;
# descrizione: string;
# imageUrl: string; 


@router.get("/inizializzaContent")
async def inizializza_content():
    db = SessionLocal()
    try:
        contenuti = db.query(ContenutiSitoDB).all()
        result = [
            {
            "id": c.id,
            "titolo": c.titolo,
            "descrizione": c.descrizione,
            "imageUrl": c.imageUrl # già in base64
            }
            for c in contenuti
        ]
        return result
    finally:
        db.close()

#modifica Content
@router.put("/modificaContent")
async def modifica_galleria(req: Request):
    try:
        data = await req.json() #data diventa già un dict
    except Exception:
        raise HTTPException(status_code=400, detail="JSON malformato")

    token = get_admin_token_from_cookie(req)

    if token != FAKE_ADMIN_TOKEN:
        raise HTTPException(
            status_code=403, 
            detail="Autorizzazione negata. Token non valido o scaduto."
        )

    if not data:
        raise HTTPException(status_code=400, detail="Il body della richiesta è vuoto.")

    db = SessionLocal()
    try:
        contenuto = db.query(ContenutiSitoDB).filter(ContenutiSitoDB.id == data.get("id")).first()
        if not contenuto:
            raise HTTPException(status_code=404, detail="Contenuto non trovato")

        contenuto.titolo = data.get("titolo", contenuto.titolo)
        contenuto.descrizione = data.get("descrizione", contenuto.descrizione)
        contenuto.imageUrl = data.get("imageUrl", contenuto.imageUrl)

        db.commit()
        db.refresh(contenuto)

        return {"message": "Modifica avvenuta con successo", "nuovo_oggetto": {
            "id": contenuto.id,
            "titolo": contenuto.titolo,
            "descrizione": contenuto.descrizione,
            "imageUrl": contenuto.imageUrl
        }}
    finally:
        db.close()


@router.put("/aggiungiContent")
async def aggiungi_content(req: Request):
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
        nuovo_contenuto = ContenutiSitoDB(
            titolo=data.get("titolo", ""),
            descrizione=data.get("descrizione", ""),
            imageUrl=data.get("imageUrl", "")
        )
        db.add(nuovo_contenuto)
        db.commit()
        db.refresh(nuovo_contenuto)

        return {
            "id": nuovo_contenuto.id,
            "titolo": nuovo_contenuto.titolo,
            "descrizione": nuovo_contenuto.descrizione,
            "imageUrl": nuovo_contenuto.imageUrl
        }
    finally:
        db.close()


@router.post("/eliminaContent")
async def elimina_content(req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="JSON malformato")

    token = get_admin_token_from_cookie(req)
    if token != FAKE_ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Autorizzazione negata. Token non valido o scaduto.")

    content_id = data.get("id")
    if not content_id:
        raise HTTPException(status_code=400, detail="ID mancante")

    db = SessionLocal()
    try:
        contenuto = db.query(ContenutiSitoDB).filter(ContenutiSitoDB.id == content_id).first()
        if not contenuto:
            raise HTTPException(status_code=404, detail="Contenuto non trovato")

        db.delete(contenuto)
        db.commit()

        return {"message": "Contenuto eliminato con successo", "id": content_id}
    finally:
        db.close()
