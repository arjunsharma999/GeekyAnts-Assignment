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
    assignments = crud.get_all_assignments(db)
    result = []
    for a in assignments:
        if current_user.role == models.UserRole.engineer and a.engineerId != current_user.id:
            continue
        engineer = db.query(models.User).filter(models.User.id == a.engineerId).first()
        project = db.query(models.Project).filter(models.Project.id == a.projectId).first()
        assignment_dict = a.__dict__.copy()
        assignment_dict["engineerName"] = engineer.name if engineer else None
        assignment_dict["projectName"] = project.name if project else None
        result.append(assignment_dict)
    return result

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