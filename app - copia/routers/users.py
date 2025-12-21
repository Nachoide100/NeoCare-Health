from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import database, models, schemas, security

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    """
    Devuelve los datos del usuario que está actualmente autenticado.
    """
    return current_user
