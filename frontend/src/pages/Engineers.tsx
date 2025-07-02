import React, { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import { User } from '../types';

const Engineers: React.FC = () => {
  const [engineers, setEngineers] = useState<User[]>([]);
  const [filteredEngineers, setFilteredEngineers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState('');

  useEffect(() => {
    usersAPI.getAllUsers()
      .then(users => {
        const engineerUsers = users.filter(u => u.role === 'engineer');
        setEngineers(engineerUsers);
        setFilteredEngineers(engineerUsers);
      })
      .catch(() => setError('Failed to fetch engineers'));
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, skillFilter, seniorityFilter, engineers]);

  const applyFilters = () => {
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
    
    if (seniorityFilter) {
      filtered = filtered.filter(engineer => 
        engineer.seniority?.toLowerCase() === seniorityFilter.toLowerCase()
      );
    }
    
    setFilteredEngineers(filtered);
  };

  const getEmploymentType = (maxCapacity?: number) => {
    if (maxCapacity === 100) return 'Full-time';
    if (maxCapacity === 50) return 'Part-time';
    return 'Unknown';
  };

  const getSeniorityColor = (seniority?: string) => {
    switch (seniority?.toLowerCase()) {
      case 'senior': return 'bg-gray-100 text-gray-800';
      case 'mid': return 'bg-gray-50 text-gray-700';
      case 'junior': return 'bg-gray-50 text-gray-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getAvailabilityColor = (availability?: number) => {
    if (!availability) return 'text-gray-400';
    if (availability >= 80) return 'text-green-600';
    if (availability >= 50) return 'text-yellow-600';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 tracking-tight">
            Engineers
          </h1>
          <div className="mt-2 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search & Filter Engineers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or email..."
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Seniority</label>
              <select
                value={seniorityFilter}
                onChange={(e) => setSeniorityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">All Seniorities</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="block lg:hidden space-y-4">
          {filteredEngineers.map(engineer => (
            <div key={engineer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{engineer.name}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeniorityColor(engineer.seniority)}`}>
                      {engineer.seniority}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-light ${getAvailabilityColor(engineer.availablePercentage)}`}>
                    {engineer.availablePercentage}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Available</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {(engineer.skills || []).map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employment</div>
                    <div className="text-sm text-gray-900">{getEmploymentType(engineer.maxCapacity)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engineer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seniority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employment
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredEngineers.map(engineer => (
                    <tr key={engineer.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{engineer.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(engineer.skills || []).slice(0, 3).map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                              {skill}
                            </span>
                          ))}
                          {(engineer.skills || []).length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-500">
                              +{(engineer.skills || []).length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeniorityColor(engineer.seniority)}`}>
                          {engineer.seniority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getEmploymentType(engineer.maxCapacity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-medium ${getAvailabilityColor(engineer.availablePercentage)}`}>
                          {engineer.availablePercentage}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {filteredEngineers.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {engineers.length === 0 ? 'No engineers found' : 'No engineers match your search criteria'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Engineers;