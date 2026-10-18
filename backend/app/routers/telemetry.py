
from fastapi import APIRouter, Depends, HTTPException
from app.database.db import get_db
from app.models.telemetry import Telemetry
from app.schemas.telemetry import TelemetryCreate, TelemetryRead
from app.repository.telemetry_repository import TelemetryRepository

router = APIRouter(prefix="/telemetry")


def get_telemetry_repo(db: list[Telemetry] = Depends(get_db)) -> TelemetryRepository:
    return TelemetryRepository(db)

# GET telemetry data
@router.get("", response_model= list[Telemetry])
async def read_all_telemetry_data(satelliteId: str | None = None, status: str | None = None, repo: TelemetryRepository = Depends(get_telemetry_repo)):
    return await repo.get_all()

# POST telemetry data
@router.post("", response_model=TelemetryRead)
async def add_telementry_entry(newTlm: TelemetryCreate, repo: TelemetryRepository = Depends(get_telemetry_repo)):
    telemetry = Telemetry(**newTlm.model_dump())
    return await repo.create(telemetry)

# GET specific telemetry entry by id
@router.get("/{id}", response_model=TelemetryRead)
async def get_tlm_by_id(id: str,  repo: TelemetryRepository = Depends(get_telemetry_repo)) :
    """
    Retrive a specific telemetry entry by ID
    """
    telemetry = await repo.find_by_id(id)
    if telemetry is None:
        raise HTTPException(status_code=404, detail=f"Telemetry entry to retrieve not found for ID {id}.")
    
    return telemetry

# # DELETE specific telemetry entry by ID
@router.delete("/{id}")
async def delete_tlm_by_id(id: str, repo: TelemetryRepository = Depends(get_telemetry_repo)):
    """
    Delete a specific telemetry entry by ID
    """
    deleted = await repo.delete_by_id(id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Telemetry entry to delete not found for ID {id}.")
    
    return {'status': f'Entry id {id} delete success.'}