from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey, Table, JSON
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(enum.Enum):
    engineer = "engineer"
    manager = "manager"

class SeniorityLevel(enum.Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"

class ProjectStatus(enum.Enum):
    planning = "planning"
    active = "active"
    completed = "completed"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    # Engineer fields
    skills = Column(JSON)  # List of strings
    seniority = Column(Enum(SeniorityLevel))
    maxCapacity = Column(Integer)  # 100 for full-time, 50 for part-time
    department = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    assignments = relationship("Assignment", back_populates="engineer")
    projects_managed = relationship("Project", back_populates="manager")
    availablePercentage = Column(Integer, default=100)  # 0-100, default fully available

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1024))
    startDate = Column(Date)
    endDate = Column(Date)
    requiredSkills = Column(JSON)  # List of strings
    teamSize = Column(Integer)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.planning)
    managerId = Column(Integer, ForeignKey("users.id"))
    manager = relationship("User", back_populates="projects_managed")
    assignments = relationship("Assignment", back_populates="project")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    engineerId = Column(Integer, ForeignKey("users.id"))
    projectId = Column(Integer, ForeignKey("projects.id"))
    allocationPercentage = Column(Integer)  # 0-100
    startDate = Column(Date)
    endDate = Column(Date)
    role = Column(String(255))  # 'Developer', 'Tech Lead', etc.
    engineer = relationship("User", back_populates="assignments")
    project = relationship("Project", back_populates="assignments") 