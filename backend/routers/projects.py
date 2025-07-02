from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud, database, auth, models

router = APIRouter(prefix="/projects", tags=["projects"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(get_db),
    current_manager: models.User = Depends(auth.get_current_manager)
):
    return crud.create_project(db, project, current_manager.id)

@router.get("/", response_model=list[schemas.ProjectOut])
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == models.UserRole.engineer:
        # Engineers can only see projects they're assigned to
        assignments = crud.get_all_assignments(db)
        user_assignments = [a for a in assignments if a.engineerId == current_user.id]
        project_ids = [a.projectId for a in user_assignments]
        projects = [crud.get_project(db, pid) for pid in project_ids if crud.get_project(db, pid)]
        return projects
    else:
        # Managers can see all projects
        return crud.get_all_projects(db)

@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_project = crud.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Engineers can only view projects they're assigned to
    if current_user.role == models.UserRole.engineer:
        # Check if engineer is assigned to this project
        assignment = crud.get_assignment_by_engineer_and_project(db, current_user.id, project_id)
        if not assignment:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return db_project

@router.delete("/{project_id}")
def delete_project(
    project_id: int, 
    db: Session = Depends(get_db),
    current_manager: models.User = Depends(auth.get_current_manager)
):
    # Only managers can delete projects
    success = crud.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"} 