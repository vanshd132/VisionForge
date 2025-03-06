import React, { useEffect, useRef, useState } from "react";

function Preview() {
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
            const { x1, y1, x2, y2, confidence } = box;
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
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Live Object Detection</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {models.map((model, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg shadow-md flex flex-col items-center cursor-pointer transition-transform transform hover:scale-105 ${
              selectedModel === model ? "border-blue-500" : "border-gray-300"
            }`}
            onClick={() => setSelectedModel(model)}
          >
            <img
              src={
                model === "FaceDetection" ? "src/assets/face.jpg" :
                model === "WeaponDetection" ? "src/assets/weapon.jpg" : "src/assets/default.jpg"
              }
              alt={model}
              className="w-24 h-24 object-cover rounded-md"
            />
            <p className="mt-2 text-gray-700 font-semibold">{model}</p>
          </div>
        ))}
      </div>

      <button
        onClick={startDetection}
        disabled={!selectedModel}
        className={`px-6 py-3 text-lg font-semibold text-white rounded-lg shadow-md transition $ {
          selectedModel ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Start Detection
      </button>

      <div className="relative w-[640px] h-[480px] bg-black rounded-lg shadow-lg overflow-hidden">
        <video
          ref={videoRef}
          width={640}
          height={480}
          className="absolute z-10 rounded-lg"
          autoPlay
          playsInline
          muted
        ></video>
        <div ref={overlayRef} className="absolute z-30 pointer-events-none"></div>
      </div>
    </div>
  );
}

export default Preview;