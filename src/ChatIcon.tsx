import React from 'react';

interface ChatIconProps {
  onClick: () => void;
}

const ChatIcon: React.FC<ChatIconProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="fixed bottom-8 right-8 bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-400 transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <path d="M12 19c7.18 0 13-4.03 13-9s-5.82-9-13-9S1 9.03 1 14s5.82 9 13 9z"/>
      </svg>
    </button>
  );
};

export default ChatIcon;
