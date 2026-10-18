from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel, Field

class Telemetry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    satelliteId: str
    timestamp: datetime
    altitude: float
    velocity: float
    status: str