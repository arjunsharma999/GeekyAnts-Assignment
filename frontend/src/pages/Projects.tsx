import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI } from '../services/api';
import { Project, CreateProjectRequest } from '../types';

const initialForm: CreateProjectRequest = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  requiredSkills: [],
  teamSize: 1,
  status: 'planning',
};

const Projects: React.FC = () => {
  const { isManager } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<CreateProjectRequest>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deletingProject, setDeletingProject] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProjects = async () => {
    try {
      const data = await projectsAPI.getAllProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (err) {
      setError('Failed to fetch projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, projects]);

  const applyFilters = () => {
    let filtered = projects;
    
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, requiredSkills: e.target.value.split(',').map(s => s.trim()) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    // Sanitize form data before sending
    const sanitizedForm: CreateProjectRequest = {
      ...form,
      description: form.description?.trim() || undefined,
      startDate: form.startDate ? form.startDate : undefined,
      endDate: form.endDate ? form.endDate : undefined,
      requiredSkills: (form.requiredSkills || []).filter(s => s),
      teamSize: form.teamSize ? Number(form.teamSize) : undefined,
      status: form.status,
    };
    console.log('Sanitized form data:', sanitizedForm);
    try {
      await projectsAPI.createProject(sanitizedForm);
      setSuccess('Project created successfully!');
      setForm(initialForm);
      fetchProjects();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(', '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to create project');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated assignments.')) {
      return;
    }
    
    setDeletingProject(projectId);
    setError('');
    setSuccess('');
    
    try {
      await projectsAPI.deleteProject(projectId);
      setSuccess('Project deleted successfully!');
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete project');
    } finally {
      setDeletingProject(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl mb-4">Projects</h1>
      {isManager && (
        <div className="mb-8 bg-white p-4 sm:p-6 rounded shadow">
          <h2 className="text-lg sm:text-xl mb-2">Create New Project</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
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
              <label className="block text-sm font-medium">Required Skills (comma separated)</label>
              <input
                type="text"
                name="requiredSkills"
                value={(form.requiredSkills || []).join(', ')}
                onChange={handleSkillsChange}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">Team Size</label>
                <input
                  type="number"
                  name="teamSize"
                  value={form.teamSize}
                  onChange={handleChange}
                  min={1}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">All Projects</h2>
        
        {/* Search and Filter Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Projects</label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        {/* Mobile view - Cards */}
        <div className="block sm:hidden space-y-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-lg">{project.name}</div>
                {isManager && (
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={deletingProject === project.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete project"
                  >
                    {deletingProject === project.id ? (
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
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Status:</span> {project.status}</div>
                <div><span className="font-medium">Team Size:</span> {project.teamSize}</div>
                <div><span className="font-medium">Start:</span> {project.startDate || '-'}</div>
                <div><span className="font-medium">End:</span> {project.endDate || '-'}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop view - Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                {isManager && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.teamSize}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.startDate || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.endDate || '-'}</td>
                  {isManager && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        disabled={deletingProject === project.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete project"
                      >
                        {deletingProject === project.id ? (
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
    </div>
  );
};

export default Projects;