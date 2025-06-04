'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function UploadModel() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.pt')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid .pt file');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('model', file);

    try {
      const response = await fetch('http://localhost:3500/upload-model', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setSuccess(true);
      setFile(null);
      // Reset file input
      e.target.reset();
      
      // Redirect to user models page after 2 seconds
      setTimeout(() => {
        router.push('/user-models');
      }, 2000);
    } catch (error) {
      console.error('Error uploading model:', error);
      setError('Failed to upload model. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Upload Model</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select YOLO Model (.pt file)
                </label>
                <input
                  type="file"
                  accept=".pt"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Model'}
              </button>
            </form>

            {success && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                Model uploaded successfully! Redirecting to your models...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 