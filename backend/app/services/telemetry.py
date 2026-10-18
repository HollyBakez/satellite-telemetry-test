from app.schemas.telemetry import TelemetryStatus
from app.models.telemetry import Telemetry

def filter_telemetry(telemetry_list: list[Telemetry], satelliteId: str | None, status: TelemetryStatus | None) -> list[Telemetry]:
    """
    Returns a filtered telemetry list based satelliteId and health status.
    If neither are provided, the original telemetry list is returned.
    """
    if satelliteId is not None:
        telemetry_list = [telemetry for telemetry in telemetry_list if telemetry.satelliteId == satelliteId]
    if status is not None:
        telemetry_list = [telemetry for telemetry in telemetry_list if telemetry.status == status]
    return telemetry_list