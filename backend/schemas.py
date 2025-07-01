from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date
from enum import Enum

class UserRole(str, Enum):
    engineer = "engineer"
    manager = "manager"

class SeniorityLevel(str, Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"

class ProjectStatus(str, Enum):
    planning = "planning"
    active = "active"
    completed = "completed"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    skills: Optional[List[str]] = []
    seniority: Optional[SeniorityLevel]
    maxCapacity: Optional[int]
    department: Optional[str]
    availablePercentage: Optional[int] = 100

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str]
    startDate: Optional[date]
    endDate: Optional[date]
    requiredSkills: Optional[List[str]] = []
    teamSize: Optional[int]
    status: Optional[ProjectStatus] = ProjectStatus.planning

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: int
    managerId: int
    class Config:
        orm_mode = True

class AssignmentBase(BaseModel):
    engineerId: int
    projectId: int
    allocationPercentage: int
    startDate: Optional[date]
    endDate: Optional[date]
    role: Optional[str]

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentOut(AssignmentBase):
    id: int
    class Config:
        orm_mode = True 