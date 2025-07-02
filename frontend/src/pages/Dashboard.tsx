import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Project, Assignment, User } from '../types';
import { projectsAPI, assignmentsAPI, usersAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const { user, isManager, isEngineer } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isManager) {
          // Managers can see all projects, assignments, and engineers
          const [projectsData, assignmentsData, engineersData] = await Promise.all([
            projectsAPI.getAllProjects(),
            assignmentsAPI.getAllAssignments(),
            usersAPI.getAllUsers()
          ]);
          setProjects(projectsData);
          setAssignments(assignmentsData);
          setEngineers(engineersData.filter(u => u.role === 'engineer'));
        } else if (isEngineer && user) {
          // Engineers can only see their own assignments and related projects
          const assignmentsData = await assignmentsAPI.getAllAssignments();
          const userAssignments = assignmentsData.filter(a => a.engineerId === user.id);
          setAssignments(userAssignments);
          
          // Get projects for user's assignments
          const projectIds = userAssignments.map(a => a.projectId);
          const projectsData = await Promise.all(
            projectIds.map(id => projectsAPI.getProjectById(id))
          );
          setProjects(projectsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isManager, isEngineer, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <div className="text-sm text-gray-500 font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
            Good morning, {user?.name}
          </h1>
          <div className="flex items-center space-x-2 text-sm text-black">
            <span>{isManager ? 'Manager' : 'Engineer'}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-black font-medium mb-2">
                  {isManager ? 'Total Projects' : 'My Projects'}
                </p>
                <p className="text-2xl font-light text-gray-900">{projects.length}</p>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-black font-medium mb-2">
                  {isManager ? 'Team Members' : 'Assignments'}
                </p>
                <p className="text-2xl font-light text-gray-900">
                  {isManager ? engineers.length : assignments.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-black font-medium mb-2">
                  Active Projects
                </p>
                <p className="text-2xl font-light text-gray-900">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white border border-gray-100 rounded-xl mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              {isManager ? 'Projects Overview' : 'My Projects'}
            </h3>
            <p className="text-sm text-gray-800 mt-1">
              Manage and track project progress
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider hidden sm:table-cell">
                    Team Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider hidden md:table-cell">
                    Manager
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-25 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 mb-1">{project.name}</div>
                        <div className="text-xs text-black line-clamp-2">{project.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'active' 
                            ? 'bg-black text-white' 
                            : project.status === 'completed' 
                            ? 'bg-gray-50 text-gray-600' 
                            : 'bg-gray-50 text-gray-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            project.status === 'active' 
                              ? 'bg-gray-400' 
                              : project.status === 'completed' 
                              ? 'bg-gray-300' 
                              : 'bg-gray-200'
                          }`}></div>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-black hidden sm:table-cell">
                        {project.teamSize || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-black hidden md:table-cell">
                        {project.manager?.name || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assignments Section */}
        {assignments.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h3 className="text-lg font-medium text-gray-900">
                {isManager ? 'Team Assignments' : 'My Assignments'}
              </h3>
              <p className="text-sm text-black mt-1">
                Current work allocations and responsibilities
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Engineer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider hidden sm:table-cell">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider hidden md:table-cell">
                      Allocation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-25 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-black">
                        {assignment.engineer?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-black">
                        {assignment.project?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-black hidden sm:table-cell">
                        {assignment.role || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-black hidden md:table-cell">
                        {assignment.allocationPercentage ? (
                          <div className="flex items-center space-x-2">
                            <span>{assignment.allocationPercentage}%</span>
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div 
                                className="bg-gray-400 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${assignment.allocationPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;