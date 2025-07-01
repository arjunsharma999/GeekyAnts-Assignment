from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud, database, auth, models

router = APIRouter(prefix="/assignments", tags=["assignments"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.AssignmentOut)
def create_assignment(
    assignment: schemas.AssignmentCreate, 
    db: Session = Depends(get_db),
    current_manager: models.User = Depends(auth.get_current_manager)
):
    # Only managers can assign engineers to projects
    return crud.create_assignment(db, assignment)

@router.get("/", response_model=list[schemas.AssignmentOut])
def get_all_assignments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == models.UserRole.engineer:
        # Engineers can only see their own assignments
        assignments = crud.get_all_assignments(db)
        return [a for a in assignments if a.engineerId == current_user.id]
    else:
        # Managers can see all assignments
        return crud.get_all_assignments(db)

@router.get("/{assignment_id}", response_model=schemas.AssignmentOut)
def get_assignment(
    assignment_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_assignment = crud.get_assignment(db, assignment_id)
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Engineers can only view their own assignments
    if current_user.role == models.UserRole.engineer:
        if db_assignment.engineerId != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return db_assignment 