import React, { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import { User } from '../types';

const Engineers: React.FC = () => {
  const [engineers, setEngineers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    usersAPI.getAllUsers()
      .then(users => setEngineers(users.filter(u => u.role === 'engineer')))
      .catch(() => setError('Failed to fetch engineers'));
  }, []);

  const getEmploymentType = (maxCapacity?: number) => {
    if (maxCapacity === 100) return 'Full-time';
    if (maxCapacity === 50) return 'Part-time';
    return 'Unknown';
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Engineers</h1>
      {error && <div className="text-red-600">{error}</div>}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th>Name</th>
            <th>Skills</th>
            <th>Seniority</th>
            <th>Employment Type</th>
            <th>Current Availability</th>
          </tr>
        </thead>
        <tbody>
          {engineers.map(engineer => (
            <tr key={engineer.id}>
              <td>{engineer.name}</td>
              <td>{(engineer.skills || []).join(', ')}</td>
              <td>{engineer.seniority}</td>
              <td>{getEmploymentType(engineer.maxCapacity)}</td>
              <td>{engineer.availablePercentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Engineers; 