from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class ProfileUpdate(BaseModel):
    name: str
    bodyweight: float | None = Field(None, gt=0, description="Berat badan harus di atas 0 kg")
    age_category: str | None = None
    division: str | None = None

class ProfileResponse(BaseModel):
    id: UUID
    name: str
    bodyweight: float | None = None
    age_category: str | None = None
    division: str | None = None
    class Config:
        from_attributes = True

# VALIDASI BARU: Beban wajib > 0, Repetisi wajib >= 1
class LiftLogCreate(BaseModel):
    lift_type: str
    weight: float = Field(..., gt=0, description="Beban angkatan harus lebih dari 0 kg")
    reps: int = Field(..., ge=1, description="Repetisi minimal harus 1 kali")
    rpe: float | None = Field(None, ge=1, le=10, description="RPE skala 1 sampai 10")

class LiftLogResponse(BaseModel):
    id: UUID
    lift_type: str
    weight: float
    reps: int
    rpe: float | None = None
    e1rm: float
    created_at: datetime
    class Config:
        from_attributes = True

class MeetCreate(BaseModel):
    meet_name: str
    date: datetime
    federation: str | None = None

class MeetResponse(BaseModel):
    id: UUID
    meet_name: str
    date: datetime
    federation: str | None = None
    created_at: datetime
    class Config:
        from_attributes = True

# VALIDASI BARU: Angkatan kompetisi tidak boleh minus
class AttemptCreate(BaseModel):
    lift_type: str
    attempt_number: int = Field(..., ge=1, le=3)
    weight: float = Field(..., gt=0, description="Beban target kompetisi harus lebih dari 0 kg")
    status: str = "planned"

class AttemptResponse(BaseModel):
    id: UUID
    meet_id: UUID
    lift_type: str
    attempt_number: int
    weight: float
    status: str
    class Config:
        from_attributes = True