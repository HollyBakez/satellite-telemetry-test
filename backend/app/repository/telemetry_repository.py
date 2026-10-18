from typing import Optional
from app.models.telemetry import Telemetry
class TelemetryRepository:
    def __init__(self, db: list[Telemetry]):
        self.db = db

    # find entry
    async def find_by_id(self, id: str) -> Optional[Telemetry]:
        for row in self.db:
            if row["id"] == id:
                return row["id"]
        return None
    
    # delete entry
    async def delete_by_id(self, id: str) -> bool:
        for index, row in self.db:
            if row["id"] == id:
                self.db.pop(index)
                return True
        return False
            
    #  return all entries
    async def get_all(self) -> list[Telemetry]:
        return self.db
        
    #  create entry
    async def create(self, telemetry: Telemetry) -> Telemetry:
        self.db.append(telemetry)
        return telemetry