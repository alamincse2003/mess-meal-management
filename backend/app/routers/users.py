from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meal import Meal  # noqa: F401  (registers Meal for User.meals relationship resolution)
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse
from app.security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter()


@router.post("", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
    )
    db.add(new_user)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create user")

    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == credentials.email).first()

    invalid_credentials = HTTPException(
        status_code=401, detail="Invalid email or password"
    )

    if existing_user is None or existing_user.password_hash is None:
        raise invalid_credentials

    if not verify_password(credentials.password, existing_user.password_hash):
        raise invalid_credentials

    access_token = create_access_token(existing_user.id)
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get("", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.id == user_id).first()

    if existing_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return existing_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if existing_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    existing_user.name = user.name
    existing_user.email = user.email

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update user",
        )

    db.refresh(existing_user)

    return existing_user


@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.id == user_id).first()

    if existing_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    has_meals = db.query(Meal).filter(Meal.user_id == user_id).first() is not None

    if has_meals:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete user with existing meals",
        )

    deleted_user = UserResponse.model_validate(existing_user)
    db.delete(existing_user)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete user")

    return deleted_user