import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, assignmentsAPI, usersAPI } from '../services/api';
import { Project, Assignment, User } from '../types';

interface AnalyticsData {
  totalEngineers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageUtilization: number;
  skillDistribution: { [key: string]: number };
  projectStatusDistribution: { [key: string]: number };
  engineerUtilization: { name: string; utilization: number }[];
}

const Analytics: React.FC = () => {
  const { isManager } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredEngineers, setFilteredEngineers] = useState<User[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, assignmentsData, engineersData] = await Promise.all([
          projectsAPI.getAllProjects(),
          assignmentsAPI.getAllAssignments(),
          usersAPI.getAllUsers(),
        ]);
        setProjects(projectsData);
        setAssignments(assignmentsData);
        setEngineers(engineersData.filter(u => u.role === 'engineer'));
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (projects.length > 0 && assignments.length > 0 && engineers.length > 0) {
      calculateAnalytics();
    }
  }, [projects, assignments, engineers]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, skillFilter, statusFilter, engineers, projects]);

  const calculateAnalytics = () => {
    const totalEngineers = engineers.length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    // Calculate skill distribution
    const skillDistribution: { [key: string]: number } = {};
    engineers.forEach(engineer => {
      engineer.skills?.forEach(skill => {
        skillDistribution[skill] = (skillDistribution[skill] || 0) + 1;
      });
    });

    // Calculate project status distribution
    const projectStatusDistribution: { [key: string]: number } = {};
    projects.forEach(project => {
      projectStatusDistribution[project.status] = (projectStatusDistribution[project.status] || 0) + 1;
    });

    // Calculate engineer utilization
    const engineerUtilization = engineers.map(engineer => {
      const engineerAssignments = assignments.filter(a => a.engineerId === engineer.id);
      const totalAllocation = engineerAssignments.reduce((sum, a) => sum + (a.allocationPercentage || 0), 0);
      return {
        name: engineer.name,
        utilization: Math.min(totalAllocation, 100)
      };
    });

    // Calculate average utilization
    const averageUtilization = engineerUtilization.length > 0 
      ? engineerUtilization.reduce((sum, e) => sum + e.utilization, 0) / engineerUtilization.length 
      : 0;

    setAnalyticsData({
      totalEngineers,
      totalProjects,
      activeProjects,
      completedProjects,
      averageUtilization,
      skillDistribution,
      projectStatusDistribution,
      engineerUtilization
    });
  };

  const applyFilters = () => {
    // Filter engineers
    let filtered = engineers;
    
    if (searchTerm) {
      filtered = filtered.filter(engineer => 
        engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        engineer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (skillFilter) {
      filtered = filtered.filter(engineer => 
        engineer.skills?.some(skill => 
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      );
    }
    
    setFilteredEngineers(filtered);

    // Filter projects
    let filteredProj = projects;
    
    if (searchTerm) {
      filteredProj = filteredProj.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filteredProj = filteredProj.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(filteredProj);
  };

  const renderUtilizationBar = (utilization: number) => {
    const percentage = Math.min(utilization, 100);
    const color = percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <div className="text-sm text-gray-500 font-medium">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
            Analytics & Search
          </h1>
          <p className="text-sm text-gray-600">
            Team utilization insights and search functionality
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search & Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search engineers or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Skill</label>
              <input
                type="text"
                placeholder="e.g., React, Python..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
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

        {/* Analytics Overview */}
        {analyticsData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Total Engineers</p>
                  <p className="text-2xl font-light text-gray-900">{analyticsData.totalEngineers}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Total Projects</p>
                  <p className="text-2xl font-light text-gray-900">{analyticsData.totalProjects}</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Active Projects</p>
                  <p className="text-2xl font-light text-gray-900">{analyticsData.activeProjects}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Avg Utilization</p>
                  <p className="text-2xl font-light text-gray-900">{analyticsData.averageUtilization.toFixed(1)}%</p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Team Utilization Chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Team Utilization</h3>
            <div className="space-y-4">
              {analyticsData?.engineerUtilization.map((engineer, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium text-gray-700 truncate">
                    {engineer.name}
                  </div>
                  <div className="flex-1">
                    {renderUtilizationBar(engineer.utilization)}
                  </div>
                  <div className="w-12 text-sm text-gray-500 text-right">
                    {engineer.utilization.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Distribution Chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Distribution</h3>
            <div className="space-y-3">
              {analyticsData && Object.entries(analyticsData.skillDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([skill, count]) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{skill}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / engineers.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Engineers Results */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-lg font-medium text-gray-900">
                Engineers ({filteredEngineers.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {filteredEngineers.map((engineer) => (
                <div key={engineer.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{engineer.name}</h4>
                      <p className="text-sm text-gray-500">{engineer.email}</p>
                      <div className="mt-1">
                        {engineer.skills?.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {engineer.seniority || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Capacity: {engineer.maxCapacity || 0}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Results */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-lg font-medium text-gray-900">
                Projects ({filteredProjects.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {filteredProjects.map((project) => (
                <div key={project.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : project.status === 'completed' 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-500">
                        Team: {project.teamSize || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.startDate && new Date(project.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 