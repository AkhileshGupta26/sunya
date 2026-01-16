from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- Auth & User Models ---
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    settings_gender: str = "male"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    current_streak: int
    detox_streak: int = 0
    last_detox_date: Optional[str] = None
    total_days: int
    zen_passes: int
    total_points: int = 0
    wake_time: Optional[str] = None
    profile_picture: Optional[str] = None
    circle_id: Optional[str] = None
    institution_id: Optional[str] = None
    settings_camera_enabled: bool = False
    settings_bpm_check: bool = False
    settings_timer_check: bool = False
    settings_gender: str = "male" # "male" (teal) or "female" (rose)
    settings_alarm_enabled: bool = False
    settings_alarm_time: Optional[str] = "06:00"
    settings_alarm_ringtone: str = "meditation_flute"
    active_contests: List[str] = [] # Replaces active_contest
    contest_joined_weekly_at: Optional[str] = None
    contest_joined_monthly_at: Optional[str] = None
    weekly_points: int = 0
    monthly_points: int = 0
    badges: List[str] = []

# --- Settings & Profile Updates ---
class UserSettingsUpdate(BaseModel):
    camera_enabled: Optional[bool] = None
    bpm_check: Optional[bool] = None
    timer_check: Optional[bool] = None
    alarm_enabled: Optional[bool] = None
    alarm_time: Optional[str] = None
    alarm_ringtone: Optional[str] = None

class WakeTimeUpdate(BaseModel):
    wake_time: str  # Format: "HH:MM"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    profile_picture: Optional[str] = None # Base64 or URL
    settings_gender: Optional[str] = None

# --- Meditation Session Models ---
class MeditationSession(BaseModel):
    track_type: str  # vedic, nature, guided, silence
    completed: bool
    bpm_verified: bool
    awareness_probe_passed: bool
    duration_seconds: int = 0

class SessionResponse(BaseModel):
    id: str
    date: str
    track_type: str
    completed: bool
    grace_timer_completed: bool

# --- Circle & Social Models ---
class CircleCreate(BaseModel):
    name: str

class CircleJoin(BaseModel):
    code: str

class CircleResponse(BaseModel):
    id: str
    code: str
    name: str
    harmony_score: float
    members: List[dict]

class ZenNudge(BaseModel):
    target_user_id: str
    message: str = "Time to meditate! 🧘"

# --- Institution Models ---
class InstitutionJoin(BaseModel):
    institution_name: str

class InstitutionResponse(BaseModel):
    id: str
    name: str
    total_minutes: int
    member_count: int
    rank: int

# --- Detox Models ---
class DetoxComplete(BaseModel):
    duration_minutes: int
