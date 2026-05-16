import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, Tuple
import base64
from PIL import Image
import io

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Eye landmarks indices (from MediaPipe Face Mesh)
LEFT_EYE = [362, 385, 387, 386, 374, 373, 390, 249]
RIGHT_EYE = [33, 160, 158, 133, 153, 144, 163, 7]

# main class fo r face liveness detection
class FaceLivenessService:
    def __init__(self):
        self.face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    # eye aspect ration to detect blinks
    def calculate_ear(self, eye_points: list) -> float:
        """Calculate Eye Aspect Ratio"""
        A = np.linalg.norm(eye_points[1] - eye_points[5])
        B = np.linalg.norm(eye_points[2] - eye_points[4])
        C = np.linalg.norm(eye_points[0] - eye_points[3])
        ear = (A + B) / (2.0 * C)
        return ear

    # main method to process image and return liveness  
    def process_image(self, image_bytes: bytes) -> Dict:
        """Process single image or frame for liveness"""
        # Convert bytes to numpy array
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        rgb_image = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_image)

        if not results.multi_face_landmarks:
            return {
                "success": False,
                "trust_score": 0.0,
                "message": "No face detected",
                "details": {}
            }

        face_landmarks = results.multi_face_landmarks[0]
        landmarks = np.array([[lm.x, lm.y] for lm in face_landmarks.landmark])

        # Get eye points
        left_eye_points = landmarks[LEFT_EYE]
        right_eye_points = landmarks[RIGHT_EYE]

        left_ear = self.calculate_ear(left_eye_points)
        right_ear = self.calculate_ear(right_eye_points)
        avg_ear = (left_ear + right_ear) / 2

        # Simple head pose estimation (using nose tip and chin)
        nose = landmarks[1]
        forehead = landmarks[10]

        # Basic liveness signals
        blink_score = 1.0 if 0.15 < avg_ear < 0.4 else 0.6  # Natural eye openness
        movement_score = 1.0 if abs(nose[1] - forehead[1]) > 0.1 else 0.7

        trust_score = (blink_score * 0.5 + movement_score * 0.3 + (1.0 if avg_ear > 0.1 else 0.0) * 0.2)

        return {
            "success": True,
            "trust_score": round(float(trust_score), 3),
            "message": "Liveness check completed",
            "details": {
                "avg_ear": round(float(avg_ear), 3),
                "left_ear": round(float(left_ear), 3),
                "right_ear": round(float(right_ear), 3),
                "face_detected": True,
                "recommended_action": "PASS" if trust_score > 0.65 else "CHALLENGE"
            }
        }


# instantiation
liveness_service = FaceLivenessService()