'use client';

import Navbar from '@/components/Navbar';

export default function ApiDocumentation() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">API Documentation</h1>

        <div className="space-y-8">
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Get Available Models</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Endpoint</h3>
                <code className="bg-gray-100 p-2 rounded block">GET /models</code>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Response</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify({
                    models: ["model1", "model2", "model3"]
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Detect Objects</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Endpoint</h3>
                <code className="bg-gray-100 p-2 rounded block">POST /detect</code>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Request Body</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify({
                    model: "model_name",
                    frame: "base64_encoded_image"
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Response</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify({
                    detections: [
                      {
                        x1: 100,
                        y1: 100,
                        x2: 200,
                        y2: 200,
                        confidence: 0.95,
                        class: "person"
                      }
                    ]
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Upload Model</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Endpoint</h3>
                <code className="bg-gray-100 p-2 rounded block">POST /upload-model</code>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Request</h3>
                <p className="text-gray-600">Multipart form data with a .pt file</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Response</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify({
                    message: "Model uploaded successfully",
                    model_id: "abc123"
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Get User Models</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Endpoint</h3>
                <code className="bg-gray-100 p-2 rounded block">GET /user-models</code>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Response</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify({
                    user_models: ["model1", "model2"]
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
} 