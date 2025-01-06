import React, { useState, useEffect } from 'react';
import myImage from './images/logo.png';
import userImage from './images/user.png';
import botImage from './images/chat-bot.png';
import thumbsupImage from './images/thumb-up.png';
import thumbsdownImage from './images/thumb-down.png';

const options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

const Chatbot6: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ user: string; bot: string | null; timestamp: string; liked: boolean; disliked: boolean; reason: string | null; chat_id: number | null }[]>([]);
  const [popupVisible, setPopupVisible] = useState<{ visible: boolean; x: number; y: number; index: number | null }>({ visible: false, x: 0, y: 0, index: null });
  const [dislikeReason, setDislikeReason] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(true);

  useEffect(() => {
    if (chatHistory.length === 0) {
      const welcomeMessage = {
        user: "",
        bot: "Hi, I am HR Assistant to help in understanding HR Policies, Procedures, and practices followed in Kumaran systems. How can I help you?",
        timestamp: new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase(),
        liked: false,
        disliked: false,
        reason: null,
        chat_id: null,
      };
      setChatHistory([welcomeMessage]);
    }
  }, [chatHistory]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = message;

    const newChatEntry = {
      user: userMessage,
      bot: null,
      timestamp: new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase(),
      liked: false,
      disliked: false,
      reason: null,
      chat_id: null
    };

    setChatHistory(prev => [...prev, newChatEntry]);
    setMessage('');
    setIsBotThinking(true);

    const response = await fetch('http://localhost:5000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_input: userMessage }),
    });

    const data = await response.json();
    console.log(data);

    setTimeout(() => {
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1].bot = data.response;
        updatedHistory[updatedHistory.length - 1].timestamp = new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase();
        return updatedHistory;
      });

      const updatedChatEntry = {
        ...newChatEntry,
        bot: data.response,
        timestamp: new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase(),
        chat_id: data.chat_id,
      };

      setChatHistory(prev => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1].chat_id = data.chat_id;
        return updatedHistory;
      });

      setIsBotThinking(false);
    }, 3000);
  };

  const handleContextMenu = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    setPopupVisible({ visible: true, x: clientX, y: clientY, index });
  };

  const handleLikeDislike = (isLike: boolean) => {
    if (popupVisible.index !== null) {
      const updatedHistory = [...chatHistory];
      const currentChat = updatedHistory[popupVisible.index];

      if (isLike) {
        if (currentChat.disliked) {
          currentChat.disliked = false;
          currentChat.reason = null;
        }
        currentChat.liked = true;
      } else {
        if (currentChat.liked) {
          currentChat.liked = false;
        }
        currentChat.disliked = true;
        setDislikeReason('');
      }

      setChatHistory(updatedHistory);
      setPopupVisible({ visible: false, x: 0, y: 0, index: null });

      const feedbackData = {
        chat_id: currentChat.chat_id,
        liked: currentChat.liked,
        disliked: currentChat.disliked,
        reason: currentChat.reason,
      };

      updateFeedback(feedbackData);
    }
  };

  const handleDislikeReasonSubmit = (index: number) => {
    if (dislikeReason && index !== null) {
      const updatedHistory = [...chatHistory];
      const currentChat = updatedHistory[index];
      currentChat.reason = dislikeReason;
      setChatHistory(updatedHistory);

      const feedbackData = {
        chat_id: currentChat.chat_id,
        liked: currentChat.liked,
        disliked: currentChat.disliked,
        reason: currentChat.reason,
      };

      updateFeedback(feedbackData);

      setDislikeReason(null);
    }
    setPopupVisible({ visible: false, x: 0, y: 0, index: null });
  };

  const updateFeedback = async (chatEntry: any) => {
    await fetch('http://localhost:5000/update-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatEntry),
    });
    console.log("updateeeee:", chatEntry);
  };

  const renderMessage = (message: string) => {
    return message.split("\n").map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index !== message.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="p-1 bg-gray-100 flex items-center justify-center mx-0">
      <div className="bg-white shadow-md rounded-lg p-4 w-full md:w-1/2 lg:w-full">
        <div className="flex items-center justify-between bg-black text-white h-20 mx-0 md:flex-row">
          <img src={myImage} alt="Logo" className="h-20 w-48" />
          <h2 className="text-2xl font-bold font-mono text-blue-400 md:text-lg sm:text-xs lg:text-2xl">HR AI CHAT BOARD</h2>
        </div>
        <div className="overflow-y-auto h-[600px] mb-4">
          {chatHistory.map((chat, index) => (
            <div key={index} className="flex flex-col">
              {chat.user && (
                <div className="flex justify-end mr-40">
                  <div className="flex flex-col">
                    <div className="flex justify-end">
                      <span className="text-black text-[11px] font-['Arial']">{chat.timestamp}</span>
                    </div>
                    <div className="flex flex-row">
                      <img src={userImage} alt="Icon" className="w-5 h-5 mr-1" />
                      <span className="text-black p-1 rounded-lg max-w-fit border-2 border-blue-900 font-serif text-sm text-wrap text-left">{chat.user}</span>
                    </div>
                  </div>
                </div>
              )}

              {chat.bot && (
                <div className="flex items-center ml-1" onContextMenu={(e) => handleContextMenu(index, e)}>
                  <div className="flex flex-col">
                    <div className="flex justify-end">
                      <span className="text-black text-[11px] font-['Arial']">{chat.timestamp}</span>
                    </div>
                    <div className="flex flex-row">
                      <img src={botImage} alt="Icon" className="w-7 h-7 mr-1" />
                      <span className="text-black p-1 rounded-lg max-w-fit border-1 font-serif text-sm lg:w-[800px] text-left bg-blue-200 max:md:w-1/2 max-sm:w-4/5">{renderMessage(chat.bot)}</span>
                    </div>
                    {chat.liked && <div className="flex justify-end"><img src={thumbsupImage} alt="Like" className="w-7 h-7" title="Like" /></div>}
                    {chat.disliked && (
                      <div className="flex justify-end">
                        <img src={thumbsdownImage} alt="Dislike" className="w-7 h-7" title="Dislike" />
                        <span className="text-red-500 text-sm font-sans"> (Comment: {chat.reason})</span>
                      </div>
                    )}
                    {chat.disliked && !chat.reason && showCommentBox && (
                      <div className="flex justify-end mt-1">
                        <input
                          type="text"
                          value={dislikeReason || ''}
                          onChange={(e) => setDislikeReason(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleDislikeReasonSubmit(index);
                            }
                          }}
                          placeholder="Enter reason for dislike..."
                          className="border border-gray-300 rounded p-1"
                        />
                        <div onClick={() => { setShowCommentBox(false); }} className="cursor-pointer ml-2 text-red-500" title="Close">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isBotThinking && (
            <div className="flex items-center ml-40 mt-4">
              <img src={botImage} alt="Thinking..." className="w-7 h-7 mr-1" />
              <span className="text-black text-sm">Bot is typing...</span>
            </div>
          )}
        </div>
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="border border-gray-300 rounded p-2 flex-grow mr-2"
          />
          <button type="submit" className="bg-blue-500 text-white rounded px-4">Send</button>
        </form>

        {popupVisible.visible && (
          <div
            className="absolute bg-white shadow-lg border rounded p-2"
            style={{ top: popupVisible.y, left: popupVisible.x }}>
            <button onClick={() => handleLikeDislike(true)}>
              <img src={thumbsupImage} alt="Like" className="w-7 h-7" title="Like" />
            </button>
            <button onClick={() => handleLikeDislike(false)}>
              <img src={thumbsdownImage} alt="Dislike" className="w-7 h-7" title="Dislike" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot6;
