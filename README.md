# Engineering Resource Management System (ERMS)

A full-stack web application for managing engineering resources, projects, and assignments with role-based access control.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Manager/Engineer)
- Secure password hashing with bcrypt

### Login cred for manager and engineer
manger - email - arjunverma@gmail.com password - admin999
Engineer - email - ankit@gmail.com password - admin999

### 👥 User Management
- User registration and login
- Role-based permissions
- Engineer profiles with skills and capacity

### 📊 Project Management
- Create and manage projects
- Project status tracking (Planning/Active/Completed)
- Required skills specification
- Team size management

### 🔗 Assignment Management
- Assign engineers to projects
- Allocation percentage tracking
- Role assignment within projects
- Start/end date management

### 🎯 Role-Based Access

#### Manager Permissions:
- ✅ Create and manage projects
- ✅ Assign engineers to projects
- ✅ View all projects and assignments
- ✅ View team dashboard and workload
- ✅ Manage engineers

#### Engineer Permissions:
- ❌ Cannot create projects
- ❌ Cannot assign others to projects
- ✅ View only assigned projects
- ✅ View own assignments
- ✅ Update personal profile

## Tech Stack

### Backend
- **Python FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **MySQL** - Database
- **Alembic** - Database migrations
- **JWT** - Authentication tokens
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Headless UI** - Accessible components

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── crud.py              # Database operations
│   ├── auth.py              # Authentication logic
│   └── routers/             # API endpoints
│       ├── users.py
│       ├── projects.py
│       └── assignments.py
├── requirements.txt
└── .env                     # Environment variables

frontend/
├── src/
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── contexts/           # React contexts
│   ├── types/              # TypeScript types
│   └── App.tsx             # Main app component
├── public/
└── package.json
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role ENUM('engineer', 'manager') NOT NULL,
    skills JSON,
    seniority ENUM('junior', 'mid', 'senior'),
    maxCapacity INT,
    department VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL
);
```

### Projects Table
```sql
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1024),
    startDate DATE,
    endDate DATE,
    requiredSkills JSON,
    teamSize INT,
    status ENUM('planning', 'active', 'completed') DEFAULT 'planning',
    managerId INT,
    FOREIGN KEY (managerId) REFERENCES users(id)
);
```

### Assignments Table
```sql
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    engineerId INT NOT NULL,
    projectId INT NOT NULL,
    allocationPercentage INT,
    startDate DATE,
    endDate DATE,
    role VARCHAR(255),
    FOREIGN KEY (engineerId) REFERENCES users(id),
    FOREIGN KEY (projectId) REFERENCES projects(id)
);
```

## Setup Instructions

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   # Create .env file with your database credentials
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DB=eng_resource_mgmt
   SECRET_KEY=your-secret-key
   ```

3. **Set up database:**
   ```sql
   CREATE DATABASE eng_resource_mgmt;
   ```

4. **Run the backend:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## API Endpoints

### Authentication
- `POST /users/register` - Register new user
- `POST /users/token` - Login
- `GET /users/me` - Get current user

### Projects (Manager only)
- `GET /projects/` - Get all projects
- `POST /projects/` - Create project
- `GET /projects/{id}` - Get project by ID

### Assignments (Manager only)
- `GET /assignments/` - Get all assignments
- `POST /assignments/` - Create assignment
- `GET /assignments/{id}` - Get assignment by ID

### Users (Manager only)
- `GET /users/` - Get all users

## Usage Examples

### Creating a Manager Account
```bash
curl -X POST "http://localhost:8000/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@company.com",
    "name": "John Manager",
    "role": "manager",
    "password": "securepassword"
  }'
```

### Creating an Engineer Account
```bash
curl -X POST "http://localhost:8000/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "engineer@company.com",
    "name": "Jane Engineer",
    "role": "engineer",
    "password": "securepassword",
    "skills": ["Python", "React", "SQL"],
    "seniority": "senior",
    "maxCapacity": 100,
    "department": "Engineering"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/users/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=manager@company.com&password=securepassword"
```

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **Role-Based Access Control** - Granular permissions
- **CORS Protection** - Configured for frontend communication
- **Input Validation** - Pydantic schemas for data validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 