import React, { useState, useEffect, useRef } from "react";

const App = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [gestureStatus, setGestureStatus] = useState("No gesture detected");
  const [showTutorial, setShowTutorial] = useState(false);
  const socketRef = useRef(null);

  // Updated handleStart function for App.jsx
  const handleStart = () => {
    if (socketRef.current) return; // Prevent multiple sockets

    const socket = new WebSocket("ws://localhost:5000");
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      // Send start message to initiate gesture detection
      socket.send("start");
      setShowTutorial(true);
    };

    socket.onmessage = (event) => setGestureStatus(event.data);

    socket.onclose = () => {
      setIsConnected(false);
      socketRef.current = null;
    };
  };

  // Updated code to handle disconnect button
  const handleDisconnect = () => {
    if (socketRef.current) {
      // Send stop message before closing
      socketRef.current.send("stop");
      socketRef.current.close();
    }
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleScroll = () => {
    setScrollPosition(window.pageYOffset);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const GestureTutorial = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl max-w-4xl w-11/12 max-h-[90vh] overflow-y-auto">
        <h2 className="text-center text-2xl font-bold text-blue-600 mb-8">
          Gesture Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "👆", text: "Point with index finger to move cursor" },
            { icon: "👍", text: "Thumbs up for left click" },
            { icon: "🤙", text: "Hang loose for right click" },
            { icon: "✌️", text: "Victory sign for double click" },
            { icon: "🤏", text: "Pinch for drag & drop" },
            { icon: "👊", text: "Fist for screenshot" },
          ].map((gesture, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 bg-gray-100 rounded-lg"
            >
              <div className="text-5xl mb-4">{gesture.icon}</div>
              <p className="text-center">{gesture.text}</p>
            </div>
          ))}
        </div>
        <button
          className="block mx-auto mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300"
          onClick={() => setShowTutorial(false)}
        >
          Got It!
        </button>
      </div>
    </div>
  );

  const features = [
    {
      icon: "👆",
      title: "Precision Cursor Control",
      description:
        "Move your cursor with natural hand movements for precise control",
    },
    {
      icon: "🖱️",
      title: "Smart Click Actions",
      description: "Left, right, and double click with simple gestures",
    },
    {
      icon: "📷",
      title: "Instant Screenshots",
      description: "Capture your screen with a quick gesture",
    },
    {
      icon: "📦",
      title: "Drag & Drop",
      description: "Move files and objects effortlessly with drag gestures",
    },
    {
      icon: "🔍",
      title: "Zoom Control",
      description: "Pinch to zoom in and out of documents and images",
    },
    {
      icon: "🔄",
      title: "Scroll Gestures",
      description: "Scroll pages up and down with hand movements",
    },
  ];

  const testimonials = [
    {
      text: "This changed how I present in meetings. No more reaching for the mouse during presentations!",
      author: "Sarah, Educator",
    },
    {
      text: "As a developer, this saves me so much time when debugging code. The gesture controls are surprisingly precise.",
      author: "Mark, Software Engineer",
    },
    {
      text: "Perfect for my digital art workflow. I can zoom and pan without switching tools constantly.",
      author: "Jamie, Digital Artist",
    },
  ];

  return (
    <div className="relative overflow-x-hidden">
      {/* Connection Status Bar */}
      <div
        className={`fixed top-0 left-0 w-full py-2 px-8 text-center font-semibold z-40 transition-all duration-300 ${
          isConnected ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        {isConnected ? "Connected to Gesture Control" : "Disconnected"}
        {isConnected && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-sm font-normal md:static md:transform-none md:mt-2 md:text-xs">
            Current Gesture:{" "}
            <span className="font-semibold">{gestureStatus}</span>
          </div>
        )}
      </div>

      {showTutorial && <GestureTutorial />}

      {/* Hero Section */}
      <header
        className={`flex flex-col md:flex-row min-h-[90vh] px-4 md:px-[5%] py-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative transition-all duration-300 overflow-hidden ${
          scrollPosition > 50 ? "min-h-[80vh]" : ""
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] rotate-12 -top-1/2 -left-1/2 w-[200%] h-[200%] z-0"></div>

        <div className="flex-1 flex flex-col justify-center items-start md:pr-8 relative z-10 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Hand Gesture Recognition
          </h1>
          <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-xl">
            Revolutionize how you interact with your computer using intuitive
            hand gestures
          </p>
          <button
            className={`px-8 py-4 text-lg font-semibold bg-white text-blue-600 rounded-full cursor-pointer flex items-center gap-2 hover:bg-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
              isConnected ? "bg-green-500 text-white" : ""
            }`}
            onClick={handleStart}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {isConnected ? "Control Active" : "Start Gesture Control"}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Disconnect
            </button>
          )}
        </div>

        <div className="flex-1 flex justify-center items-center relative z-10">
          <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-white bg-opacity-10 rounded-3xl backdrop-blur-md border-2 border-white border-opacity-20 overflow-hidden shadow-2xl">
            {isConnected ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 relative">
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs py-1 px-3 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-[url('https://media.giphy.com/media/XcQ0XH7OqRqQk/giphy.gif')] bg-center bg-cover"></div>
            )}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-[10%] text-center bg-white">
        <h2 className="text-4xl font-bold mb-12 inline-block relative">
          Powerful Features
          <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-600 rounded"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-2 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-4 text-blue-600">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-[10%] bg-gray-100 text-center">
        <h2 className="text-4xl font-bold mb-12">How It Works</h2>

        <div className="flex flex-col md:flex-row justify-center gap-12 mb-16 flex-wrap">
          {[
            "Enable your webcam when prompted",
            "Perform gestures in view of your camera",
            "Control your computer effortlessly with natural movements",
          ].map((step, index) => (
            <div key={index} className="flex-1 min-w-[200px] max-w-xs">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex justify-center items-center text-2xl font-bold mx-auto mb-6 shadow-md">
                {index + 1}
              </div>
              <p className="text-lg">{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h3 className="text-xl mb-6 text-gray-500">Powered By</h3>
          <div className="flex justify-center gap-12 flex-wrap">
            {[
              {
                name: "MediaPipe",
                img: "https://mediapipe.dev/images/mediapipe_small.png",
              },
              {
                name: "OpenCV",
                img: "https://opencv.org/wp-content/uploads/2020/07/OpenCV_logo_black-2.png",
              },
              {
                name: "React",
                img: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
              },
            ].map((tech, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <img
                  src={tech.img}
                  alt={tech.name}
                  className="w-16 h-16 object-contain"
                />
                <span className="font-semibold">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-[10%] text-center bg-white">
        <h2 className="text-4xl font-bold mb-12">What Users Say</h2>

        <div className="flex flex-wrap gap-8 justify-center">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-sm relative"
            >
              <p className="italic mb-4 relative z-10">{testimonial.text}</p>
              <div className="font-bold text-blue-600">
                {testimonial.author}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-[10%] text-center bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] rotate-12 -top-1/2 -left-1/2 w-[200%] h-[200%] z-0"></div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-8">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users revolutionizing their computer interaction
          </p>

          <button
            className={`px-8 py-4 text-lg font-semibold bg-white text-blue-600 rounded-full cursor-pointer transition-all duration-300 hover:bg-gray-100 ${
              isConnected ? "bg-green-500 text-white" : ""
            }`}
            onClick={handleStart}
          >
            {isConnected ? "Control Active" : "Start Gesture Control Now"}
          </button>

          <div className="flex justify-center gap-8 mt-8 flex-wrap md:flex-nowrap">
            {["Windows", "macOS", "Linux"].map((os, index) => (
              <span
                key={index}
                className="bg-white bg-opacity-10 px-4 py-2 rounded-full text-sm"
              >
                ✓ {os}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-[10%]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-6">
              Hand Gesture Recognition
            </h3>
            <p className="text-gray-300">
              Revolutionizing human-computer interaction through intuitive
              gesture controls.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
            <div className="flex flex-col gap-3">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Contact Us",
                "Documentation",
              ].map((link, index) => (
                <a
                  key={index}
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Connect</h3>
            <div className="flex flex-col gap-3">
              {["Twitter", "GitHub", "Discord"].map((social, index) => (
                <a
                  key={index}
                  href={`#${social.toLowerCase()}`}
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm pt-8 border-t border-gray-800">
          <p>
            © {new Date().getFullYear()} Hand Gesture Recognition. All rights
            reserved.
          </p>
          <p className="mt-2">Made with ❤️ using OpenCV, MediaPipe & React</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
