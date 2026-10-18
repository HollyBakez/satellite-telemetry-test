from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

"""
 Defines Telemetry Creation schema and handles its validation for:
  - valid ISO 8601 datetime 
  - altitude must be greater than 0, positive number
  - velocity must be greater than 0, positive number
  - status is typed as enum strings, predefined as healthy, warning, and critical based on the assumption of 
    keeping things simple since the status values were not strictly defined in requirements.
"""

class TelemetryCreate(BaseModel):
    satelliteId: str
    timestamp: datetime
    altitude: float = Field(gt=0)
    velocity: float = Field(gt=0)
    status: TelemetryStatus

class TelemetryRead(BaseModel):
    id: str
    satelliteId: str
    timestamp: datetime
    altitude: float
    velocity: float
    status: TelemetryStatus

"""
Status is assumed to be an enum string, to make it easier to filter by, easily extendable for other status enums.
"""
class TelemetryStatus(str, Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
