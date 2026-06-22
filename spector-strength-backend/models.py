import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Enum 
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from database import Base

class UserRole(enum.Enum):
    ATHLETE = "athlete"
    COACH = "coach"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.ATHLETE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    name = Column(String, nullable=False)
    bodyweight = Column(Float, nullable=True)
    age_category = Column(String, nullable=True)
    division = Column(String, nullable=True)
    user = relationship("User", back_populates="profile")

class LiftLog(Base):
    __tablename__ = "lift_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lift_type = Column(String, nullable=False)
    weight = Column(Float, nullable=False)
    reps = Column(Integer, nullable=False)
    rpe = Column(Float, nullable=True)
    e1rm = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")

# ==================== TABEL BARU: MEETS & ATTEMPTS ====================

class Meet(Base):
    __tablename__ = "meets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    meet_name = Column(String, nullable=False)       # Nama Kompetisi (misal: "Kejurda Powerlifting 2026")
    date = Column(DateTime, nullable=False)            # Tanggal Kompetisi
    federation = Column(String, nullable=True)         # Federasi (misal: "PABERSI", "IPF")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    # Relasi One-to-Many ke tabel Attempts (Jika Meet dihapus, rencana angkatannya ikut terhapus)
    attempts = relationship("Attempt", back_populates="meet", cascade="all, delete-orphan")

class Attempt(Base):
    __tablename__ = "attempts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    meet_id = Column(UUID(as_uuid=True), ForeignKey("meets.id"), nullable=False)
    lift_type = Column(String, nullable=False)         # squat, bench, atau deadlift
    attempt_number = Column(Integer, nullable=False)   # 1, 2, atau 3 (Upaya angkatan)
    weight = Column(Float, nullable=False)             # Beban target (kg)
    status = Column(String, default="planned")         # planned, good_lift, no_lift

    meet = relationship("Meet", back_populates="attempts")