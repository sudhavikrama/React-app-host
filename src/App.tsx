
import React, { useState,useEffect }  from 'react';
import './App.css';
import { AiOutlineUser, AiOutlineRobot, AiOutlineMessage } from 'react-icons/ai'; // Add chat icon
import Chatbot6 from './Mydesign';


const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  useEffect(() => {
    document.title = "HR AI ChatBoard"
  }, [])

  // Toggle chat window visibility
  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div>
      {/* Chat Icon - clickable */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleChatToggle}
          className="p-4 bg-blue-500 rounded-full shadow-lg text-white hover:bg-blue-600 transition-all"
        >
          <AiOutlineMessage className="text-2xl" />
        </button>
      </div>

      {/* Chat Window - only show if isChatOpen is true */}
      {isChatOpen && <Chatbot6/>}
    </div>
  );
};

export default App;


// function App() {
//   const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

//   const toggleChat = () => {
//     setIsChatOpen(prev => !prev);
//   };
//   return (
   
//     <div className="App">
    
//       <ChatWindow onClose={toggleChat} />

//     </div>
//   );
// }

// export default App;
