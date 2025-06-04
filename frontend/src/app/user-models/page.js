'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function UserModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserModels = async () => {
      try {
        const response = await fetch('http://localhost:3500/user-models');
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        setModels(data.user_models);
      } catch (error) {
        console.error('Error fetching user models:', error);
        setError('Failed to load your models. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserModels();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Models</h1>
          <Link
            href="/upload"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Upload New Model
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : models.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">You haven't uploaded any models yet.</p>
            <Link
              href="/upload"
              className="text-blue-500 hover:text-blue-600"
            >
              Upload your first model →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((modelId) => (
              <Link href={`/model/${modelId}`} key={modelId}>
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <h2 className="text-xl font-semibold mb-2">Model {modelId}</h2>
                  <p className="text-gray-600">Click to use this model for object detection</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 