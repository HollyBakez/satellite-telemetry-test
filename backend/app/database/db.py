from app.models.telemetry import Telemetry



# Simple array for simplicity to manage telemetry data
_TELEMETRY_DB: list[Telemetry] = []

def get_db():
    try:
        yield _TELEMETRY_DB
    finally:
        # If using SQLite or actual DB we'd close the connection here.
        pass

def reset_db():
    _TELEMETRY_DB.clear()