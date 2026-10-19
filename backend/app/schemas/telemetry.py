from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

"""
 Defines Telemetry Creation schema and handles its validation for:
  - valid ISO 8601 datetime 
  - altitude must be greater than 0, positive number
  - velocity must be greater than 0, positive number
"""

class TelemetryCreate(BaseModel):
    satelliteId: str
    timestamp: datetime
    altitude: float = Field(gt=0)
    velocity: float = Field(gt=0)
    status: str

class TelemetryRead(BaseModel):
    id: str
    satelliteId: str
    timestamp: datetime
    altitude: float
    velocity: float
    status: str
