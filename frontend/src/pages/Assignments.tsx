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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((a) => {
              const engineer = engineers.find(e => e.id === a.engineerId);
              const project = projects.find(p => p.id === a.projectId);
              return (
                <tr key={a.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{engineer?.name || a.engineerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{project?.name || a.projectId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{a.role || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{a.allocationPercentage || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{a.startDate || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{a.endDate || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assignments; 