from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, projects, assignments

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Engineering Resource Management System API"}

app.include_router(users.router)
app.include_router(projects.router)
app.include_router(assignments.router) 