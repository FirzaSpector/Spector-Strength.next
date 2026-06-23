import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
import jwt
from datetime import datetime, timedelta, timezone
from uuid import UUID
from dotenv import load_dotenv

from database import engine, get_db
import models
import schemas

# Load file .env di awal aplikasi
load_dotenv()

models.Base.metadata.create_all(bind=engine)
password_hash = PasswordHash((BcryptHasher(),))

# MEMBACA DARI .ENV (Jika file .env hilang, ada fallback string aman)
SECRET_KEY = os.getenv("SECRET_KEY", "TEMPORARY_FALLBACK_KEY_DO_NOT_USE_IN_PROD")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Diperketat jadi 1 jam demi keamanan

app = FastAPI(title="Spector Strength Pro API", version="2.0.0")

# Pengaturan CORS (Saat ini masih "*" untuk kemudahan localhost. Nanti bisa diganti url production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token tidak valid")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token sudah kadaluarsa, silakan login ulang")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Gagal memverifikasi token")

    user = db.query(models.User).filter(models.User.id == UUID(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User tidak ditemukan")
    return user

@app.get("/")
def home():
    return {"status": "online", "message": "Backend Spector Sudah Production-Ready! 🛡️🚀"}

@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar!")
    hashed_password = password_hash.hash(user.password)
    new_user = models.User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.TokenResponse)
def login_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not existing_user:
        raise HTTPException(status_code=401, detail="Email atau password salah!")
    try:
        is_password_correct = password_hash.verify(user.password, existing_user.password_hash)
    except Exception:
        is_password_correct = False
    if not is_password_correct:
        raise HTTPException(status_code=401, detail="Email atau password salah!")

    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {"sub": str(existing_user.id), "email": existing_user.email, "exp": expire}
    encoded_jwt = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": encoded_jwt, "token_type": "bearer"}

@app.put("/profile", response_model=schemas.ProfileResponse)
def update_profile(profile_data: schemas.ProfileUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(user_id=current_user.id, name=profile_data.name, bodyweight=profile_data.bodyweight, age_category=profile_data.age_category, division=profile_data.division)
        db.add(profile)
    else:
        profile.name = profile_data.name
        profile.bodyweight = profile_data.bodyweight
        profile.age_category = profile_data.age_category
        profile.division = profile_data.division
    db.commit()
    db.refresh(profile)
    return profile

@app.get("/profile", response_model=schemas.ProfileResponse)
def get_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil belum diisi.")
    return profile

@app.post("/lifts", response_model=schemas.LiftLogResponse)
def create_lift_log(lift: schemas.LiftLogCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if lift.lift_type.lower() not in ["squat", "bench", "deadlift"]:
        raise HTTPException(status_code=400, detail="Tipe angkatan harus: squat, bench, atau deadlift")
    if lift.reps == 1:
        calculated_e1rm = lift.weight
    else:
        denominator = 1.0278 - (0.0278 * lift.reps)
        if denominator <= 0:
            raise HTTPException(status_code=400, detail="Jumlah repetisi tidak valid")
        calculated_e1rm = round(lift.weight / denominator, 2)

    new_log = models.LiftLog(user_id=current_user.id, lift_type=lift.lift_type.lower(), weight=lift.weight, reps=lift.reps, rpe=lift.rpe, e1rm=calculated_e1rm)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@app.get("/lifts", response_model=list[schemas.LiftLogResponse])
def get_lift_logs(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.LiftLog).filter(models.LiftLog.user_id == current_user.id).order_by(models.LiftLog.created_at.desc()).all()

@app.post("/meets", response_model=schemas.MeetResponse)
def create_meet(meet: schemas.MeetCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_meet = models.Meet(user_id=current_user.id, meet_name=meet.meet_name, date=meet.date, federation=meet.federation)
    db.add(new_meet)
    db.commit()
    db.refresh(new_meet)
    return new_meet

@app.get("/meets", response_model=list[schemas.MeetResponse])
def get_user_meets(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Meet).filter(models.Meet.user_id == current_user.id).order_by(models.Meet.date.asc()).all()

@app.post("/meets/{meet_id}/attempts", response_model=schemas.AttemptResponse)
def log_attempt(meet_id: UUID, attempt_data: schemas.AttemptCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    meet = db.query(models.Meet).filter(models.Meet.id == meet_id, models.Meet.user_id == current_user.id).first()
    if not meet:
        raise HTTPException(status_code=404, detail="Kompetisi tidak ditemukan")

    if attempt_data.lift_type.lower() not in ["squat", "bench", "deadlift"]:
        raise HTTPException(status_code=400, detail="Tipe angkatan harus: squat, bench, atau deadlift")
    if attempt_data.attempt_number not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Nomor upaya angkatan harus 1, 2, atau 3")
    if attempt_data.status.lower() not in ["planned", "good_lift", "no_lift"]:
        raise HTTPException(status_code=400, detail="Status harus: planned, good_lift, atau no_lift")

    existing_attempt = db.query(models.Attempt).filter(
        models.Attempt.meet_id == meet_id,
        models.Attempt.lift_type == attempt_data.lift_type.lower(),
        models.Attempt.attempt_number == attempt_data.attempt_number
    ).first()

    if existing_attempt:
        existing_attempt.weight = attempt_data.weight
        existing_attempt.status = attempt_data.status.lower()
        attempt = existing_attempt
    else:
        attempt = models.Attempt(meet_id=meet_id, lift_type=attempt_data.lift_type.lower(), attempt_number=attempt_data.attempt_number, weight=attempt_data.weight, status=attempt_data.status.lower())
        db.add(attempt)

    db.commit()
    db.refresh(attempt)
    return attempt

@app.get("/meets/{meet_id}/attempts", response_model=list[schemas.AttemptResponse])
def get_meet_attempts(meet_id: UUID, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    meet = db.query(models.Meet).filter(models.Meet.id == meet_id, models.Meet.user_id == current_user.id).first()
    if not meet:
        raise HTTPException(status_code=404, detail="Kompetisi tidak ditemukan")
    return db.query(models.Attempt).filter(models.Attempt.meet_id == meet_id).order_by(models.Attempt.lift_type, models.Attempt.attempt_number).all()