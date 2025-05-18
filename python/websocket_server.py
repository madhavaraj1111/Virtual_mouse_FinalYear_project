import asyncio
import websockets
import cv2
import mediapipe as mp
import pyautogui
import random
import json
import util
from pynput.mouse import Button, Controller

mouse = Controller()
screen_width, screen_height = pyautogui.size()

# MediaPipe setup
mpHands = mp.solutions.hands
hands = mpHands.Hands(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7,
    max_num_hands=1
)

# Gesture detection functions
def find_finger_tip(processed):
    if processed.multi_hand_landmarks:
        hand_landmarks = processed.multi_hand_landmarks[0]
        index_finger_tip = hand_landmarks.landmark[mpHands.HandLandmark.INDEX_FINGER_TIP]
        return index_finger_tip
    return None

def move_mouse(index_finger_tip):
    if index_finger_tip is not None:
        x = int(index_finger_tip.x * screen_width)
        y = int(index_finger_tip.y / 2 * screen_height)
        pyautogui.moveTo(x, y)

def is_left_click(landmark_list, thumb_index_dist):
    return (
            util.get_angle(landmark_list[5], landmark_list[6], landmark_list[8]) < 50 and
            util.get_angle(landmark_list[9], landmark_list[10], landmark_list[12]) > 90 and
            thumb_index_dist > 50
    )

def is_right_click(landmark_list, thumb_index_dist):
    return (
            util.get_angle(landmark_list[9], landmark_list[10], landmark_list[12]) < 50 and
            util.get_angle(landmark_list[5], landmark_list[6], landmark_list[8]) > 90 and
            thumb_index_dist > 50
    )

def is_double_click(landmark_list, thumb_index_dist):
    return (
            util.get_angle(landmark_list[5], landmark_list[6], landmark_list[8]) < 50 and
            util.get_angle(landmark_list[9], landmark_list[10], landmark_list[12]) < 50 and
            thumb_index_dist > 50
    )

def is_screenshot(landmark_list, thumb_index_dist):
    return (
            util.get_angle(landmark_list[5], landmark_list[6], landmark_list[8]) < 50 and
            util.get_angle(landmark_list[9], landmark_list[10], landmark_list[12]) < 50 and
            thumb_index_dist < 50
    )

def is_drag(landmark_list, thumb_index_dist):
    return thumb_index_dist < 30  # Pinching motion

def is_drop(landmark_list, thumb_index_dist):
    return thumb_index_dist > 50  # Releasing fingers

# Global variables
dragging = False
active_connections = set()
gesture_task = None

async def detect_gesture(websocket):
    global dragging
    draw = mp.solutions.drawing_utils
    cap = cv2.VideoCapture(0)
    
    try:
        while cap.isOpened() and websocket in active_connections:
            ret, frame = cap.read()
            if not ret:
                break
                
            frame = cv2.flip(frame, 1)
            frameRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            processed = hands.process(frameRGB)

            landmark_list = []
            current_gesture = "No gesture detected"
            
            if processed.multi_hand_landmarks:
                hand_landmarks = processed.multi_hand_landmarks[0]
                draw.draw_landmarks(frame, hand_landmarks, mpHands.HAND_CONNECTIONS)
                for lm in hand_landmarks.landmark:
                    landmark_list.append((lm.x, lm.y))

                index_finger_tip = find_finger_tip(processed)
                
                if len(landmark_list) >= 21:
                    thumb_index_dist = util.get_distance([landmark_list[4], landmark_list[5]])

                    # Handle mouse movement
                    if util.get_distance([landmark_list[4], landmark_list[5]]) < 50 and util.get_angle(landmark_list[5], landmark_list[6], landmark_list[8]) > 90:
                        move_mouse(index_finger_tip)
                        current_gesture = "Moving cursor"
                    
                    # Handle left click
                    elif is_left_click(landmark_list, thumb_index_dist):
                        mouse.press(Button.left)
                        mouse.release(Button.left)
                        current_gesture = "Left click"
                    
                    # Handle right click
                    elif is_right_click(landmark_list, thumb_index_dist):
                        mouse.press(Button.right)
                        mouse.release(Button.right)
                        current_gesture = "Right click"
                    
                    # Handle double click
                    elif is_double_click(landmark_list, thumb_index_dist):
                        pyautogui.doubleClick()
                        current_gesture = "Double click"
                    
                    # Handle screenshot
                    elif is_screenshot(landmark_list, thumb_index_dist):
                        im1 = pyautogui.screenshot()
                        label = random.randint(1, 1000)
                        im1.save(f'my_screenshot_{label}.png')
                        current_gesture = "Screenshot taken"
                    
                    # Handle drag
                    elif is_drag(landmark_list, thumb_index_dist):
                        if not dragging:
                            mouse.press(Button.left)
                            dragging = True
                        move_mouse(index_finger_tip)
                        current_gesture = "Dragging"
                    
                    # Handle drop
                    elif is_drop(landmark_list, thumb_index_dist) and dragging:
                        mouse.release(Button.left)
                        dragging = False
                        current_gesture = "Dropped"

            # Send gesture status to the client
            await websocket.send(current_gesture)
            
            cv2.imshow('Frame', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
            # Adding a small delay to prevent high CPU usage
            await asyncio.sleep(0.03)
            
    except websockets.exceptions.ConnectionClosed:
        print("Connection closed")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        if dragging:
            mouse.release(Button.left)
            dragging = False

async def handler(websocket):
    global gesture_task, active_connections
    
    print("Client connected")
    active_connections.add(websocket)
    
    try:
        async for message in websocket:
            if message == "start":
                # Cancel any existing gesture task
                if gesture_task and not gesture_task.done():
                    gesture_task.cancel()
                    
                # Start gesture detection
                gesture_task = asyncio.create_task(detect_gesture(websocket))
                print("Gesture detection started")
            elif message == "stop":
                if gesture_task and not gesture_task.done():
                    gesture_task.cancel()
                    print("Gesture detection stopped")
    except websockets.exceptions.ConnectionClosed:
        print("Connection closed")
    finally:
        active_connections.remove(websocket)
        if websocket in active_connections:
            active_connections.remove(websocket)

async def main():
    async with websockets.serve(handler, "localhost", 5000):
        print("WebSocket server started on ws://localhost:5000")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())