from typing import Optional
from app.models.telemetry import Telemetry
"""
Repository layer to handle DB transactions. For this test a simple array is used.
With this repository layer we can extend it to support selected DB of choice, async was used to make it extensible for actual DB integration.
"""
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