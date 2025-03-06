import React, { useEffect, useRef, useState } from "react";

function App() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [detectionActive, setDetectionActive] = useState(false);
  const videoRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3500/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.models) setModels(data.models);
      })
      .catch((err) => console.error("Error fetching models:", err));
  }, []);

  const startDetection = () => {
    if (!selectedModel) {
      alert("Please select a model first!");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setDetectionActive(true);
        requestAnimationFrame(processFrame);
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  const processFrame = () => {
    if (!detectionActive || !videoRef.current) return;

    const video = videoRef.current;
    const rect = video.getBoundingClientRect();

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frameData = canvas.toDataURL("image/jpeg");

    fetch("http://localhost:3500/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: selectedModel, frame: frameData }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.detections) {
          if (overlayRef.current) {
            overlayRef.current.innerHTML = "";
          }

          data.detections.forEach((box) => {
            const { x1, y1, x2, y2, class: className, confidence } = box;

            const boxDiv = document.createElement("div");
            boxDiv.style.position = "absolute";
            boxDiv.style.left = `${rect.left + (x1 / video.videoWidth) * rect.width}px`;
            boxDiv.style.top = `${rect.top + (y1 / video.videoHeight) * rect.height}px`;
            boxDiv.style.width = `${((x2 - x1) / video.videoWidth) * rect.width}px`;
            boxDiv.style.height = `${((y2 - y1) / video.videoHeight) * rect.height}px`;
            boxDiv.style.border = `2px solid ${confidence > 0.5 ? "green" : "red"}`;
            boxDiv.style.zIndex = "30";

            overlayRef.current.appendChild(boxDiv);
          });
        }

        requestAnimationFrame(processFrame);
      })
      .catch((err) => {
        console.error("Error during detection:", err);
        requestAnimationFrame(processFrame);
      });
  };

  return (
    <div className="p-5 space-y-5 relative">
      <h1 className="text-2xl font-bold">Live Object Detection</h1>

      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="w-full md:w-1/2 p-2 border rounded-md"
      >
        <option value="" disabled>Select a Model</option>
        {models.map((model, index) => (
          <option key={index} value={model}>
            {model}
          </option>
        ))}
      </select>

      <button
        onClick={startDetection}
        disabled={!selectedModel}
        className={`mt-3 p-2 ${
          selectedModel ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400"
        } text-white rounded-md`}
      >
        Start Detection
      </button>

      <div className="mt-5 relative w-[640px] h-[480px]">
        <video
          ref={videoRef}
          width={640}
          height={480}
          className="absolute z-10 rounded-md"
          autoPlay
          playsInline
          muted
        ></video>
        <div ref={overlayRef} className="absolute z-30 pointer-events-none"></div>
      </div>
    </div>
  );
}

export default App;
