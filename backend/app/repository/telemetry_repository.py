from typing import Optional
from app.models.telemetry import Telemetry
class TelemetryRepository:
    def __init__(self, db: list[Telemetry]):
        self.db = db

    async def find_by_id(self, id: str) -> Optional[Telemetry]:
        for row in self.db:
            print(row)
            if row.id == id:
                return row
        return None
    
    async def delete_by_id(self, id: str) -> bool:
        for row in self.db:
            if row.id == id:
                index = self.db.index(row)
                self.db.pop(index)
                return True
        return False
            
    async def get_all(self) -> list[Telemetry]:
        return self.db
        
    async def create(self, telemetry: Telemetry) -> Telemetry:
        self.db.append(telemetry)
        return telemetry