
from fastapi import APIRouter, Depends, HTTPException
from app.database.db import get_db
from app.models.telemetry import Telemetry
from app.schemas.telemetry import TelemetryCreate, TelemetryRead, TelemetryStatus
from app.repository.telemetry_repository import TelemetryRepository
from app.services.telemetry import filter_telemetry

router = APIRouter(prefix="/telemetry")

# Initialize telemetry repository to use.
def get_telemetry_repo(db: list[Telemetry] = Depends(get_db)) -> TelemetryRepository:
    return TelemetryRepository(db)

@router.get("", response_model= list[Telemetry])
async def read_all_telemetry_data(satelliteId: str | None = None, status: TelemetryStatus | None = None, repo: TelemetryRepository = Depends(get_telemetry_repo)):
    all_telemetry = await repo.get_all()

    if len(all_telemetry) == 0:
        return all_telemetry

    filtered_results = filter_telemetry(all_telemetry, satelliteId, status)
    return filtered_results

@router.post("", response_model=TelemetryRead)
async def add_telementry_entry(newTlm: TelemetryCreate, repo: TelemetryRepository = Depends(get_telemetry_repo)):
    telemetry = Telemetry(**newTlm.model_dump())
    return await repo.create(telemetry)

@router.get("/{id}", response_model=TelemetryRead)
async def get_tlm_by_id(id: str,  repo: TelemetryRepository = Depends(get_telemetry_repo)) :
    """
    Retrive a specific telemetry entry by ID
    """
    telemetry = await repo.find_by_id(id)
    if telemetry is None:
        raise HTTPException(status_code=404, detail=f"Telemetry entry to retrieve not found for ID {id}.")
    
    return telemetry

@router.delete("/{id}")
async def delete_tlm_by_id(id: str, repo: TelemetryRepository = Depends(get_telemetry_repo)):
    """
    Delete a specific telemetry entry by ID
    """
    deleted = await repo.delete_by_id(id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Telemetry entry to delete not found for ID {id}.")
    
    return {'status': f'Entry id {id} delete success.'}