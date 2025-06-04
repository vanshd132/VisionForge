import cv2
import threading
import time
from ultralytics import YOLO

# Load the trained model
model = YOLO("best.pt")

# Open the webcam (0 is for the default camera)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

# Set webcam properties
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)  # Set width
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)  # Set height

# Global variables
frame = None
predictions = []
last_inference_time = time.time()
processing_interval = 0.5 # 2 frames per second

# Function to perform inference at 2 FPS
def infer_frame():
    global predictions, last_inference_time, frame

    while True:
        current_time = time.time()

        # Perform inference every 0.5 seconds (2 FPS)
        if current_time - last_inference_time >= processing_interval:
            if frame is not None:
                # Perform inference on the current frame
                results = model.predict(frame, show=False)
                predictions = results[0].boxes  # Get predicted bounding boxes
                last_inference_time = current_time

# Start inference thread
thread = threading.Thread(target=infer_frame)
thread.daemon = True
thread.start()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Draw bounding boxes if predictions exist
    if predictions:
        for box in predictions:
            # Extract box coordinates and confidence
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            confidence = box.conf[0] * 100
            class_name = box.cls[0]  # Adjust according to your classes

            # Draw the rectangle and label
            color = (0, 255, 0) if confidence > 50 else (0, 0, 255)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"{class_name} ({confidence:.1f}%)", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    # Show the frame with or without results
    cv2.imshow("YOLO Detection", frame)

    # Break the loop on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
