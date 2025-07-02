import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assignmentsAPI, projectsAPI, usersAPI } from '../services/api';
import { Assignment, CreateAssignmentRequest, Project, User } from '../types';

const initialForm: CreateAssignmentRequest = {
  engineerId: 0,
  projectId: 0,
  allocationPercentage: 0,
  startDate: '',
  endDate: '',
  role: '',
};

const Assignments: React.FC = () => {
  const { isManager } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [form, setForm] = useState<CreateAssignmentRequest>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deletingAssignment, setDeletingAssignment] = useState<number | null>(null);

  // Fetch all assignments, projects, and engineers
  const fetchData = async () => {
    try {
      const [assignmentsData, projectsData, usersData] = await Promise.all([
        assignmentsAPI.getAllAssignments(),
        projectsAPI.getAllProjects(),
        usersAPI.getAllUsers(),
      ]);
      setAssignments(assignmentsData);
      setProjects(projectsData);
      setEngineers(usersData.filter(u => u.role === 'engineer'));
    } catch (err) {
      setError('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate available capacity for an engineer
  function getAvailableCapacity(engineer: User): number {
    const activeAssignments = assignments.filter(
      a => a.engineerId === engineer.id && (!a.endDate || new Date(a.endDate) >= new Date())
    );
    const totalAllocated = activeAssignments.reduce((sum, a) => sum + (a.allocationPercentage || 0), 0);
    return (engineer.maxCapacity || 0) - totalAllocated;
  }

  // Skill matching
  function matchesSkills(engineer: User, project: Project | undefined): boolean {
    if (!project || !project.requiredSkills || !engineer.skills) return false;
    return project.requiredSkills.some(skill => engineer.skills?.includes(skill));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await assignmentsAPI.createAssignment({
        ...form,
        engineerId: Number(form.engineerId),
        projectId: Number(form.projectId),
        allocationPercentage: Number(form.allocationPercentage),
      });
      setSuccess('Assignment created successfully!');
      setForm(initialForm);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }
    
    setDeletingAssignment(assignmentId);
    setError('');
    setSuccess('');
    
    try {
      await assignmentsAPI.deleteAssignment(assignmentId);
      setSuccess('Assignment deleted successfully!');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete assignment');
    } finally {
      setDeletingAssignment(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl mb-4">Assignments</h1>
      {isManager && (
        <div className="mb-8 bg-white p-6 rounded shadow">
          <h2 className="text-xl mb-2">Create Assignment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Project</label>
              <select
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Engineer</label>
              <select
                name="engineerId"
                value={form.engineerId}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select an engineer</option>
                {engineers.map((engineer) => {
                  const project = projects.find(p => p.id === Number(form.projectId));
                  const available = getAvailableCapacity(engineer);
                  const skillMatch = matchesSkills(engineer, project);
                  return (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.name} | Capacity: {available} | Skills: {engineer.skills?.join(', ') || '-'}
                      {skillMatch ? ' ⭐' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Allocation Percentage</label>
              <input
                type="number"
                name="allocationPercentage"
                value={form.allocationPercentage}
                onChange={handleChange}
                min={1}
                max={100}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Role</label>
              <input
                type="text"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g. Developer, Tech Lead"
              />
            </div>
            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded hover:bg-black disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Create Assignment'}
            </button>
          </form>
        </div>
      )}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">All Assignments</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engineer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
              {isManager && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((a) => (
              <tr key={a.id}>
                <td className="px-6 py-4 whitespace-nowrap">{a.engineerName || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{a.projectName || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{a.role || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{a.allocationPercentage || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{a.startDate || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{a.endDate || '—'}</td>
                {isManager && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteAssignment(a.id)}
                      disabled={deletingAssignment === a.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete assignment"
                    >
                      {deletingAssignment === a.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assignments; 