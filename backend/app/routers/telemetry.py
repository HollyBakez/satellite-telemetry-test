
from fastapi import APIRouter, Depends, HTTPException, Query
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
async def get_all_telemetry_data(limit: str= Query(default='10'), offset: int = Query(default=0, ge=0), satelliteId: str | None = Query(default=None, min_length=1), status: TelemetryStatus | None = Query(default=None), repo: TelemetryRepository = Depends(get_telemetry_repo)):
    """
    Returns a set amount of telemetry entries from the database. The telemetry entries are filtered by satelliteId and status if either are provided.
    The filtered results are then paginated into a set amount based on the limit and offset.
    Default is first 10 entries. Client can increase the limit or request all of the entries since the endpoint is intended to retrieve all telemetry data.
    """
    all_telemetry = await repo.get_all()

    filtered_results = filter_telemetry(all_telemetry, satelliteId, status)

    if limit.strip().lower() == "all":
        return filtered_results
    try:
        limit = int(limit)
    except ValueError:
        raise HTTPException(status_code=422, detail="limit must be a positive integer or 'all'")
    
    if limit <= 0:
        raise HTTPException(
            status_code=422,
            detail="limit must be greater than 0",
        )

    return filtered_results[offset : offset + limit]

@router.post("", response_model=TelemetryRead)
async def create_telementry_entry(payload: TelemetryCreate, repo: TelemetryRepository = Depends(get_telemetry_repo)):
    telemetry = Telemetry(**payload.model_dump())
    return await repo.create(telemetry)

@router.get("/{id}", response_model=TelemetryRead)
async def get_telemetry_by_id(id: str,  repo: TelemetryRepository = Depends(get_telemetry_repo)) :
    """
    Retrive a specific telemetry entry by ID
    """
    telemetry = await repo.find_by_id(id)
    if telemetry is None:
        raise HTTPException(status_code=404, detail=f"Telemetry entry to retrieve not found for ID {id}.")
    
    return telemetry

@router.delete("/{id}")
async def delete_telemetry_by_id(id: str, repo: TelemetryRepository = Depends(get_telemetry_repo)):
    """
    Delete a specific telemetry entry by ID
    """
    deleted = await repo.delete_by_id(id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Telemetry entry to delete not found for ID {id}.")
    
    return {'status': 'ok'}