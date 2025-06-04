'use client';

import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';

// Dynamically import Webcam to avoid SSR issues
const Webcam = dynamic(() => import('react-webcam'), {
  ssr: false,
  loading: () => <div className="w-full h-[480px] bg-gray-200 animate-pulse rounded-lg"></div>
});

export default function ModelPage() {
  const { id } = useParams();
  const webcamRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const detectObjects = useCallback(async () => {
    if (!webcamRef.current || !id) return;

    const imageSrc = webcamRef.current.getScreenshot();
    setIsDetecting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3500/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: id,
          frame: imageSrc,
        }),
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const data = await response.json();
      setDetections(data.detections);
    } catch (error) {
      console.error('Error detecting objects:', error);
      setError('Failed to detect objects. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Model: {id}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg shadow-lg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user"
                }}
              />
            </div>
            <button
              onClick={detectObjects}
              disabled={isDetecting}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              {isDetecting ? 'Detecting...' : 'Detect Objects'}
            </button>
            {error && (
              <div className="text-red-500 text-center">{error}</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Detections</h2>
            {detections.length === 0 ? (
              <p className="text-gray-500">No objects detected yet</p>
            ) : (
              <div className="space-y-4">
                {detections.map((detection, index) => (
                  <div key={index} className="border-b pb-2">
                    <p className="font-medium">Class: {detection.class}</p>
                    <p>Confidence: {(detection.confidence * 100).toFixed(2)}%</p>
                    <p>Location: ({detection.x1}, {detection.y1}) to ({detection.x2}, {detection.y2})</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 