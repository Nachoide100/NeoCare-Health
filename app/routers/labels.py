from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Label, Card
from app.auth import get_current_user

router = APIRouter(
    prefix="/labels",
    tags=["Labels"]
)

# ---------------------------------------------------------
# Crear una etiqueta en una tarjeta
# ---------------------------------------------------------
@router.post("/cards/{card_id}")
def add_label(card_id: int, name: str, color: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Verificar que la tarjeta existe y pertenece al usuario
    card = db.query(Card).filter(
        Card.id == card_id,
        Card.board.has(owner_id=user.id)
    ).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    label = Label(card_id=card_id, name=name, color=color)
    db.add(label)
    db.commit()
    db.refresh(label)

    return label


# ---------------------------------------------------------
# Obtener etiquetas de una tarjeta
# ---------------------------------------------------------
@router.get("/cards/{card_id}")
def get_labels(card_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    card = db.query(Card).filter(
        Card.id == card_id,
        Card.board.has(owner_id=user.id)
    ).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    return card.labels


# ---------------------------------------------------------
# Eliminar una etiqueta
# ---------------------------------------------------------
@router.delete("/{label_id}")
def delete_label(label_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    label = db.query(Label).join(Card).filter(
        Label.id == label_id,
        Card.board.has(owner_id=user.id)
    ).first()

    if not label:
        raise HTTPException(status_code=404, detail="Label not found")

    db.delete(label)
    db.commit()

    return {"message": "Label deleted"}
