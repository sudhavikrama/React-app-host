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
    <div className="p-4 bg-gray-100 flex items-center justify-center mx-0">
      <div className="bg-white shadow-md rounded-lg p-4 w-full sm:w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3">
        <div className="flex items-center justify-between bg-black text-white h-20 mb-4">
          <img src={myImage} alt="Logo" className="h-16 w-40" />
          <h2 className="text-2xl font-bold font-mono text-blue-400 sm:text-lg md:text-xl lg:text-2xl text-center">HR AI CHAT BOARD</h2>
        </div>
        <div className="overflow-y-auto h-72 md:h-[500px] mb-4">
          {chatHistory.map((chat, index) => (
            <div key={index} className="flex flex-col mb-4">
              {chat.user && (
                <div className="flex justify-end">
                  <div className="flex flex-col">
                    <div className="flex justify-end">
                      <span className="text-gray-600 text-xs font-mono">{chat.timestamp}</span>
                    </div>
                    <div className="flex items-center">
                      <img src={userImage} alt="Icon" className="w-6 h-6 mr-2" />
                      <span className="text-black p-2 rounded-lg max-w-fit border-2 border-blue-900 text-sm">{chat.user}</span>
                    </div>
                  </div>
                </div>
              )}
              {chat.bot && (
                <div className="flex items-center ml-2" onContextMenu={(e) => handleContextMenu(index, e)}>
                  <div className="flex flex-col">
                    <div className="flex justify-end">
                      <span className="text-gray-600 text-xs font-mono">{chat.timestamp}</span>
                    </div>
                    <div className="flex items-center">
                      <img src={botImage} alt="Bot Icon" className="w-7 h-7 mr-2" />
                      <span className="text-black p-2 rounded-lg max-w-fit border bg-blue-100 text-sm">{renderMessage(chat.bot)}</span>
                    </div>
                    {chat.liked && (
                      <div className="flex justify-end">
                        <img src={thumbsupImage} alt="Like" className="w-7 h-7" />
                      </div>
                    )}
                    {chat.disliked && (
                      <div className="flex justify-end">
                        <img src={thumbsdownImage} alt="Dislike" className="w-7 h-7" />
                        <span className="text-red-500 text-sm"> (Comment: {chat.reason})</span>
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
                              handleDislikeReasonSubmit(index); // Call submit function on Enter
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
            <div className="flex items-center justify-center mt-4">
              <img src={botImage} alt="Thinking..." className="w-7 h-7 mr-2" />
              <span className="text-black text-sm">Bot is typing...</span>
            </div>
          )}
        </div>
        <form onSubmit={sendMessage} className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="border border-gray-300 rounded-lg p-2 flex-grow mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">Send</button>
        </form>

        {popupVisible.visible && (
          <div className="absolute bg-white shadow-lg border rounded p-2" style={{ top: popupVisible.y, left: popupVisible.x }}>
            <button onClick={() => handleLikeDislike(true)}>
              <img src={thumbsupImage} alt="Like" className="w-7 h-7" />
            </button>
            <button onClick={() => handleLikeDislike(false)}>
              <img src={thumbsdownImage} alt="Dislike" className="w-7 h-7" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot6;





//working 70%
// import React, { useState, useEffect } from 'react';
// import myImage from './images/logo.png';
// import userImage from './images/user.png';
// import botImage from './images/chat-bot.png';
// import thumbsupImage from './images/thumb-up.png';
// import thumbsdownImage from './images/thumb-down.png';

// const options: Intl.DateTimeFormatOptions = {
//   year: 'numeric',
//   month: 'short',
//   day: 'numeric',
//   hour: '2-digit',
//   minute: '2-digit',
//   hour12: true,
// };

// const Chatbot6: React.FC = () => {
//   const [message, setMessage] = useState('');
//   const [chatHistory, setChatHistory] = useState<{ user: string; bot: string | null; timestamp: string; liked: boolean; disliked: boolean; reason: string | null; chat_id: number | null }[]>([]);
//   const [popupVisible, setPopupVisible] = useState<{ visible: boolean; x: number; y: number; index: number | null }>({ visible: false, x: 0, y: 0, index: null });
//   const [dislikeReason, setDislikeReason] = useState<string | null>(null);
//   const [isBotThinking, setIsBotThinking] = useState(false);
//   const [showCommentBox, setShowCommentBox] = useState(true);
//   const [isChatbotOpen, setIsChatbotOpen] = useState(false);

//   useEffect(() => {
//     if (chatHistory.length === 0) {
//       const welcomeMessage = {
//         user: "",
//         bot: "Hi, I am HR Assistant to help in understanding HR Policies, Procedures, and practices followed in Kumaran systems. How can I help you?",
//         timestamp: new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase(),
//         liked: false,
//         disliked: false,
//         reason: null,
//         chat_id: null,
//       };
//       setChatHistory([welcomeMessage]);
//     }
//   }, [chatHistory]);

//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const userMessage = message;

//     const newChatEntry = {
//       user: userMessage,
//       bot: null,
//       timestamp: new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase(),
//       liked: false,
//       disliked: false,
//       reason: null,
//       chat_id: null
//     };

//     setChatHistory(prev => [...prev, newChatEntry]);
//     setMessage('');
//     setIsBotThinking(true);

//     const response = await fetch('http://localhost:5000/query', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ user_input: userMessage }),
//     });

//     const data = await response.json();
//     setTimeout(() => {
//       setChatHistory(prev => {
//         const updatedHistory = [...prev];
//         updatedHistory[updatedHistory.length - 1].bot = data.response;
//         updatedHistory[updatedHistory.length - 1].timestamp = new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase();
//         return updatedHistory;
//       });

//       const updatedChatEntry = {
//         ...newChatEntry,
//         bot: data.response,
//         timestamp: new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase(),
//         chat_id: data.chat_id,
//       };

//       setChatHistory(prev => {
//         const updatedHistory = [...prev];
//         updatedHistory[updatedHistory.length - 1].chat_id = data.chat_id;
//         return updatedHistory;
//       });

//       setIsBotThinking(false);
//     }, 3000);
//   };

//   const handleContextMenu = (index: number, event: React.MouseEvent) => {
//     event.preventDefault();
//     const { clientX, clientY } = event;
//     setPopupVisible({ visible: true, x: clientX, y: clientY, index });
//   };

//   const handleLikeDislike = (isLike: boolean) => {
//     if (popupVisible.index !== null) {
//       const updatedHistory = [...chatHistory];
//       const currentChat = updatedHistory[popupVisible.index];

//       if (isLike) {
//         if (currentChat.disliked) {
//           currentChat.disliked = false;
//           currentChat.reason = null;
//         }
//         currentChat.liked = true;
//       } else {
//         if (currentChat.liked) {
//           currentChat.liked = false;
//         }
//         currentChat.disliked = true;
//         setDislikeReason('');
//       }

//       setChatHistory(updatedHistory);
//       setPopupVisible({ visible: false, x: 0, y: 0, index: null });

//       const feedbackData = {
//         chat_id: currentChat.chat_id,
//         liked: currentChat.liked,
//         disliked: currentChat.disliked,
//         reason: currentChat.reason,
//       };

//       updateFeedback(feedbackData);
//     }
//   };

//   const handleDislikeReasonSubmit = (index: number) => {
//     if (dislikeReason && index !== null) {
//       const updatedHistory = [...chatHistory];
//       const currentChat = updatedHistory[index];
//       currentChat.reason = dislikeReason;
//       setChatHistory(updatedHistory);

//       const feedbackData = {
//         chat_id: currentChat.chat_id,
//         liked: currentChat.liked,
//         disliked: currentChat.disliked,
//         reason: currentChat.reason,
//       };

//       updateFeedback(feedbackData);

//       setDislikeReason(null);
//     }
//     setPopupVisible({ visible: false, x: 0, y: 0, index: null });
//   };

//   const updateFeedback = async (chatEntry: any) => {
//     await fetch('http://localhost:5000/update-chat', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(chatEntry),
//     });
//     console.log("updateeeee:", chatEntry);
//   };

//   const renderMessage = (message: string) => {
//     return message.split("\n").map((part, index) => (
//       <React.Fragment key={index}>
//         {part}
//         {index !== message.split("\n").length - 1 && <br />}
//       </React.Fragment>
//     ));
//   };

//   const toggleChatbotWindow = () => {
//     setIsChatbotOpen(!isChatbotOpen);
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={toggleChatbotWindow}
//         className="fixed bottom-5 right-5 bg-blue-500 text-white rounded-full p-3 z-50 shadow-lg"
//       >
//         {isChatbotOpen ? 'Close Chat' : 'Open Chat'}
//       </button>

//       {isChatbotOpen && (
//         <div className="fixed bottom-0 right-0 m-4 w-full max-w-md h-96 bg-white shadow-lg rounded-lg p-4 z-50">
//           <div className="flex items-center justify-between bg-black text-white p-3 rounded-t-lg">
//             <img src={myImage} alt="Logo" className="h-10 w-20" />
//             <h2 className="text-2xl font-bold text-blue-400">HR AI CHAT</h2>
//             <button
//               onClick={toggleChatbotWindow}
//               className="text-white font-bold text-lg"
//             >
//               X
//             </button>
//           </div>

//           <div className="overflow-y-auto h-72 mb-4">
//             {chatHistory.map((chat, index) => (
//               <div key={index} className="flex flex-col">
//                 {chat.user && (
//                   <div className="flex justify-end mr-2 md:mr-10">
//                     <div className="flex flex-col">
//                       <div className="flex justify-end">
//                         <span className="text-black text-xs md:text-sm">{chat.timestamp}</span>
//                       </div>
//                       <div className="flex flex-row">
//                         <img
//                           src={userImage}
//                           alt="User Icon"
//                           className="w-5 h-5 mr-2"
//                         />
//                         <span className="text-black p-2 rounded-lg max-w-[80%] sm:max-w-[90%] md:max-w-[70%] bg-blue-100 text-sm text-left break-words">
//                           {chat.user}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {chat.bot && (
//                   <div
//                     className="flex items-center ml-2 md:ml-10"
//                     onContextMenu={(e) => handleContextMenu(index, e)}
//                   >
//                     <div className="flex flex-col">
//                       <div className="flex">
//                         <span className="text-black text-xs md:text-sm">{chat.timestamp}</span>
//                       </div>
//                       <div className="flex flex-row">
//                         <img
//                           src={botImage}
//                           alt="Bot Icon"
//                           className="w-5 h-5 mr-1"
//                         />
//                         <span className="text-black p-2 rounded-lg max-w-[80%] sm:max-w-[90%] md:max-w-[70%] bg-blue-200 text-sm text-left break-words">
//                           {renderMessage(chat.bot)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//             {isBotThinking && (
//               <div className="flex items-center ml-10 mt-4">
//                 <img
//                   src={botImage}
//                   alt="Thinking..."
//                   className="w-7 h-7 mr-2"
//                 />
//                 <span className="text-black text-sm">Bot is typing...</span>
//               </div>
//             )}
//           </div>

//           <form onSubmit={sendMessage} className="flex">
//             <input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type a message..."
//               className="border border-gray-300 rounded p-2 flex-grow mr-2 text-sm"
//             />
//             <button type="submit" className="bg-blue-500 text-white rounded px-4 text-sm">Send</button>
//           </form>

//           {popupVisible.visible && (
//             <div
//               className="absolute bg-white shadow-lg border rounded p-2"
//               style={{ top: popupVisible.y, left: popupVisible.x }}
//             >
//               <button onClick={() => handleLikeDislike(true)}>
//                 <img src={thumbsupImage} alt="Like" className="w-7 h-7" title="Like" />
//               </button>
//               <button onClick={() => handleLikeDislike(false)}>
//                 <img src={thumbsdownImage} alt="Dislike" className="w-7 h-7" title="Dislike" />
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Chatbot6;



//merged code
// import React, { useState, useEffect } from 'react';
// import myImage from './images/logo.png';
// import userImage from './images/user.png';
// import botImage from './images/chat-bot.png';
// import thumbsupImage from './images/thumb-up.png';
// import thumbsdownImage from './images/thumb-down.png';

// const options: Intl.DateTimeFormatOptions = {
//   year: 'numeric',
//   month: 'short',
//   day: 'numeric',
//   hour: '2-digit',
//   minute: '2-digit',
//   hour12: true,
// };

// const Chatbot6: React.FC = () => {
//   const [message, setMessage] = useState('');
//   const [chatHistory, setChatHistory] = useState<{ user: string; bot: string | null; timestamp: string; liked: boolean; disliked: boolean; reason: string | null; chat_id: number | null }[]>([]);
//   const [popupVisible, setPopupVisible] = useState<{ visible: boolean; x: number; y: number; index: number | null }>({ visible: false, x: 0, y: 0, index: null });
//   const [dislikeReason, setDislikeReason] = useState<string | null>(null);
//   const [isBotThinking, setIsBotThinking] = useState(false);
//   const [showCommentBox, setShowCommentBox] = useState(true);

//   useEffect(() => {
//     if (chatHistory.length === 0) {
//       const welcomeMessage = {
//         user: "",
//         bot: "Hi, I am HR Assistant to help in understanding HR Policies, Procedures, and practices followed in Kumaran systems. How can I help you?",
//         timestamp: new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase(),
//         liked: false,
//         disliked: false,
//         reason: null,
//         chat_id: null,
//       };
//       setChatHistory([welcomeMessage]);
//     }
//   }, [chatHistory]);

//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const userMessage = message;

//     const newChatEntry = {
//       user: userMessage,
//       bot: null,
//       timestamp: new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase(),
//       liked: false,
//       disliked: false,
//       reason: null,
//       chat_id: null
//     };

//     setChatHistory(prev => [...prev, newChatEntry]);
//     setMessage('');
//     setIsBotThinking(true);

//     const response = await fetch('http://localhost:5000/query', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ user_input: userMessage }),
//     });

//     const data = await response.json();
//     console.log(data);

//     setTimeout(() => {
//       setChatHistory(prev => {
//         const updatedHistory = [...prev];
//         updatedHistory[updatedHistory.length - 1].bot = data.response;
//         updatedHistory[updatedHistory.length - 1].timestamp = new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase();
//         return updatedHistory;
//       });

//       const updatedChatEntry = {
//         ...newChatEntry,
//         bot: data.response,
//         timestamp: new Date().toLocaleString('en-US', options).replace(',', '-').replace(' ', '-').replace(' ', '').toUpperCase(),
//         chat_id: data.chat_id,
//       };

//       setChatHistory(prev => {
//         const updatedHistory = [...prev];
//         updatedHistory[updatedHistory.length - 1].chat_id = data.chat_id;
//         return updatedHistory;
//       });

//       setIsBotThinking(false);
//     }, 3000);
//   };

//   const handleContextMenu = (index: number, event: React.MouseEvent) => {
//     event.preventDefault();
//     const { clientX, clientY } = event;
//     setPopupVisible({ visible: true, x: clientX, y: clientY, index });
//   };

//   const handleLikeDislike = (isLike: boolean) => {
//     if (popupVisible.index !== null) {
//       const updatedHistory = [...chatHistory];
//       const currentChat = updatedHistory[popupVisible.index];

//       if (isLike) {
//         if (currentChat.disliked) {
//           currentChat.disliked = false;
//           currentChat.reason = null;
//         }
//         currentChat.liked = true;
//       } else {
//         if (currentChat.liked) {
//           currentChat.liked = false;
//         }
//         currentChat.disliked = true;
//         setDislikeReason('');
//       }

//       setChatHistory(updatedHistory);
//       setPopupVisible({ visible: false, x: 0, y: 0, index: null });

//       const feedbackData = {
//         chat_id: currentChat.chat_id,
//         liked: currentChat.liked,
//         disliked: currentChat.disliked,
//         reason: currentChat.reason,
//       };

//       updateFeedback(feedbackData);
//     }
//   };

//   const handleDislikeReasonSubmit = (index: number) => {
//     if (dislikeReason && index !== null) {
//       const updatedHistory = [...chatHistory];
//       const currentChat = updatedHistory[index];
//       currentChat.reason = dislikeReason;
//       setChatHistory(updatedHistory);

//       const feedbackData = {
//         chat_id: currentChat.chat_id,
//         liked: currentChat.liked,
//         disliked: currentChat.disliked,
//         reason: currentChat.reason,
//       };

//       updateFeedback(feedbackData);

//       setDislikeReason(null);
//     }
//     setPopupVisible({ visible: false, x: 0, y: 0, index: null });
//   };

//   const updateFeedback = async (chatEntry: any) => {
//     await fetch('http://localhost:5000/update-chat', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(chatEntry),
//     });
//     console.log("updateeeee:", chatEntry);
//   };

//   const renderMessage = (message: string) => {
//     return message.split("\n").map((part, index) => (
//       <React.Fragment key={index}>
//         {part}
//         {index !== message.split("\n").length - 1 && <br />}
//       </React.Fragment>
//     ));
//   };

//   return (
//     <div className="p-1 bg-gray-100 flex items-center justify-center mx-0">
//       <div className="bg-white shadow-md rounded-lg p-4 w-full md:w-1/2 lg:w-full">
//         <div className="flex items-center justify-between bg-black text-white h-20 mx-0 md:flex-row">
//           <img src={myImage} alt="Logo" className="h-20 w-48" />
//           <h2 className="text-2xl font-bold font-mono text-blue-400 md:text-lg sm:text-xs lg:text-2xl lg:text-right">HR AI CHAT BOARD</h2>
//         </div>
//         <div className="overflow-y-auto h-[600px] mb-4">
//           {chatHistory.map((chat, index) => (
//             <div key={index} className="flex flex-col">
//               {chat.user && (
//                 <div className="flex justify-end mr-40">
//                   <div className="flex flex-col">
//                     <div className="flex justify-end">
//                       <span className="text-black text-[11px] font-['Arial']">{chat.timestamp}</span>
//                     </div>
//                     <div className="flex flex-row">
//                       <img src={userImage} alt="Icon" className="w-5 h-5 mr-1" />
//                       <span className="text-black p-1 rounded-lg max-w-fit border-2 border-blue-900 font-serif text-sm lg:text-wrap text-left">{chat.user}</span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {chat.bot && (
//                 <div className="flex items-center ml-1" onContextMenu={(e) => handleContextMenu(index, e)}>
//                   <div className="flex flex-col">
//                     <div className="flex justify-end">
//                       <span className="text-black text-[11px] font-['Arial']">{chat.timestamp}</span>
//                     </div>
//                     <div className="flex flex-row">
//                       <img src={botImage} alt="Icon" className="w-7 h-7 mr-1" />
//                       <span className="text-black p-1 rounded-lg max-w-fit border-1 font-serif text-sm lg:w-[800px] text-left bg-blue-200 max:md:w-1/2 max-sm:w-4/5">{renderMessage(chat.bot)}</span>
//                     </div>
//                     {chat.liked && <div className="flex justify-end"><img src={thumbsupImage} alt="Like" className="w-7 h-7" title="Like" /></div>}
//                     {chat.disliked && (
//                       <div className="flex justify-end">
//                         <img src={thumbsdownImage} alt="Dislike" className="w-7 h-7" title="Dislike" />
//                         <span className="text-red-500 text-sm font-sans"> (Comment: {chat.reason})</span>
//                       </div>
//                     )}
//                     {chat.disliked && !chat.reason && showCommentBox && (
//                       <div className="flex justify-end mt-1">
//                         <input
//                           type="text"
//                           value={dislikeReason || ''}
//                           onChange={(e) => setDislikeReason(e.target.value)}
//                           onKeyDown={(e) => {
//                             if (e.key === 'Enter') {
//                               handleDislikeReasonSubmit(index);
//                             }
//                           }}
//                           placeholder="Enter reason for dislike..."
//                           className="border border-gray-300 rounded p-1"
//                         />
//                         <div onClick={() => { setShowCommentBox(false); }} className="cursor-pointer ml-2 text-red-500" title="Close">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                           </svg>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//           {isBotThinking && (
//             <div className="flex items-center ml-40 mt-4">
//               <img src={botImage} alt="Thinking..." className="w-7 h-7 mr-1" />
//               <span className="text-black text-sm">Bot is typing...</span>
//             </div>
//           )}
//         </div>
//         <form onSubmit={sendMessage} className="flex">
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Type a message..."
//             className="border border-gray-300 rounded p-2 flex-grow mr-2"
//           />
//           <button type="submit" className="bg-blue-500 text-white rounded px-4">Send</button>
//         </form>

//         {popupVisible.visible && (
//           <div
//             className="absolute bg-white shadow-lg border rounded p-2"
//             style={{ top: popupVisible.y, left: popupVisible.x }}>
//             <button onClick={() => handleLikeDislike(true)}>
//               <img src={thumbsupImage} alt="Like" className="w-7 h-7" title="Like" />
//             </button>
//             <button onClick={() => handleLikeDislike(false)}>
//               <img src={thumbsdownImage} alt="Dislike" className="w-7 h-7" title="Dislike" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Chatbot6;


//Design ok
// import React, { useState } from 'react';
// import { AiOutlineUser, AiOutlineRobot } from 'react-icons/ai'; // Icons for user and AI

// interface ChatMessage {
//   sender: 'user' | 'ai';
//   message: string;
//   time: string;
//   liked: boolean; // Track if the message is liked
//   disliked: boolean; // Track if the message is disliked
//   dislikeReason?: string; // Store the reason for dislike
// }

// const ChatWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState<string>('');
//   const [dislikeReason, setDislikeReason] = useState<string>('');
//   const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
//   const [isReasonModalOpen, setIsReasonModalOpen] = useState<boolean>(false);
//   const [isChatMinimized, setIsChatMinimized] = useState<boolean>(false);
//   const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);

//   // Handle user input
//   const handleSendMessage = () => {
//     if (!input.trim()) return;

//     const timeStamp = new Date().toLocaleString(); // Date and Time displayed here
//     setMessages([...messages, { sender: 'user', message: input, time: timeStamp, liked: false, disliked: false }]);
//     setInput('');
//     setTimeout(() => {
//       // Simulate AI response
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: 'ai', message: 'This is an AI response.', time: new Date().toLocaleString(), liked: false, disliked: false },
//       ]);
//     }, 1000);
//   };

//   // Handle like and dislike actions
//   const handleLikeDislike = (index: number, action: 'like' | 'dislike') => {
//     const updatedMessages = [...messages];
//     if (updatedMessages[index].sender === 'ai') {
//       if (action === 'like') {
//         updatedMessages[index].liked = true; // Mark message as liked
//       } else if (action === 'dislike') {
//         updatedMessages[index].disliked = true; // Mark message as disliked
//         setSelectedMessageIndex(index); // Remember which message was disliked
//         setIsReasonModalOpen(true); // Open modal for reason
//       }
//     }
//     setMessages(updatedMessages);
//   };

//   // Handle reason submission for dislike
//   const handleSubmitReason = () => {
//     if (selectedMessageIndex !== null && dislikeReason.trim()) {
//       const updatedMessages = [...messages];
//       updatedMessages[selectedMessageIndex].dislikeReason = dislikeReason;
//       setMessages(updatedMessages);
//       setDislikeReason('');
//       setIsReasonModalOpen(false);
//     }
//   };

//   // Toggle minimize/maximize chat
//   const toggleMinimize = () => {
//     setIsChatMinimized(!isChatMinimized);
//   };

//   return (
//     <div className={`fixed bottom-16 right-8 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col transition-all ${isChatMinimized ? 'h-16' : 'h-96'}`}>
//       {/* Minimize/Maximize Button */}
//       <div className="absolute top-2 right-2">
//         <button onClick={toggleMinimize} className="text-gray-600 hover:text-gray-800">
//           {isChatMinimized ? (
//             <span className="text-2xl">⤴️</span> // Maximize icon
//           ) : (
//             <span className="text-2xl">➖</span> // Minimize icon
//           )}
//         </button>
//       </div>

//       {/* Chat Header */}
//       {!isChatMinimized && (
//         <div className="flex justify-between items-center p-4 border-b border-gray-200">
//           <span className="font-semibold text-lg">Chatbot</span>
//           <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
//             X
//           </button>
//         </div>
//       )}

//       {/* Chat Messages */}
//       {!isChatMinimized && (
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((msg, index) => (
//             <div
//               key={index}
//               className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//               onMouseEnter={() => setHoveredMessageIndex(index)} // Show like/dislike on hover
//               onMouseLeave={() => setHoveredMessageIndex(null)} // Hide like/dislike on mouse leave
//             >
//               <div>
//                 {/* Date/Time Above Message */}
//                 <div className="text-xs text-gray-500 mb-1">{msg.time}</div>

//                 <div
//                   className={`max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'} p-2 rounded-lg`}
//                 >
//                   <div className="flex items-center space-x-2">
//                     {msg.sender === 'user' ? (
//                       <AiOutlineUser className="text-xl" />
//                     ) : (
//                       <AiOutlineRobot className="text-xl" />
//                     )}
//                     <span className="text-sm">{msg.message}</span>
//                   </div>

//                   {/* Show like/dislike buttons only when hovered over the message */}
//                   {msg.sender === 'ai' && (
//                     <div className="mt-2 flex space-x-4">
//                       {/* Like Button */}
//                       {msg.liked && (
//                         <div className="flex items-center space-x-1 text-blue-500">
//                           <span>👍</span>
//                         </div>
//                       )}
//                       {/* Dislike Button */}
//                       {msg.disliked && msg.dislikeReason && (
//                         <div className="mt-2 text-xs text-red-600">
//                           <span>👎</span> <span>{msg.dislikeReason}</span>
//                         </div>
//                       )}

//                       {/* Like/Dislike buttons only shown when hovered */}
//                       {hoveredMessageIndex === index && !msg.liked && !msg.disliked && (
//                         <div className="flex space-x-4">
//                           <button
//                             onClick={() => handleLikeDislike(index, 'like')}
//                             className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
//                           >
//                             <span>👍</span>
//                           </button>
//                           <button
//                             onClick={() => handleLikeDislike(index, 'dislike')}
//                             className="flex items-center space-x-1 text-red-500 hover:text-red-700"
//                           >
//                             <span>👎</span>
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {msg.disliked && !msg.dislikeReason && (
//                     <div className="text-xs text-gray-500">Waiting for your reason...</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Send Message Section */}
//       {!isChatMinimized && (
//         <div className="flex items-center p-4 border-t border-gray-200">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Type a message..."
//             className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
//           />
//           <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-lg">
//             Send
//           </button>
//         </div>
//       )}

//       {/* Dislike Reason Modal */}
//       {isReasonModalOpen && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//             <h3 className="text-lg font-semibold mb-4">Why did you dislike this message?</h3>
//             <textarea
//               value={dislikeReason}
//               onChange={(e) => setDislikeReason(e.target.value)}
//               rows={4}
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none mb-4"
//               placeholder="Type your reason..."
//             />
//             <div className="flex justify-between">
//               <button
//                 onClick={() => setIsReasonModalOpen(false)}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmitReason}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWindow;







// import React, { useState } from 'react';
// import { AiOutlineUser, AiOutlineRobot } from 'react-icons/ai'; // Icons for user and AI

// interface ChatMessage {
//   sender: 'user' | 'ai';
//   message: string;
//   time: string;
//   liked: boolean; // Track if the message is liked
//   disliked: boolean; // Track if the message is disliked
//   dislikeReason?: string; // Store the reason for dislike
// }

// const ChatWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState<string>('');
//   const [dislikeReason, setDislikeReason] = useState<string>('');
//   const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
//   const [isReasonModalOpen, setIsReasonModalOpen] = useState<boolean>(false);
//   const [isChatMinimized, setIsChatMinimized] = useState<boolean>(false);
//   const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);

//   // Handle user input
//   const handleSendMessage = () => {
//     if (!input.trim()) return;

//     const timeStamp = new Date().toLocaleString(); // Date and Time displayed here
//     setMessages([...messages, { sender: 'user', message: input, time: timeStamp, liked: false, disliked: false }]);
//     setInput('');
//     setTimeout(() => {
//       // Simulate AI response
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: 'ai', message: 'This is an AI response.', time: new Date().toLocaleString(), liked: false, disliked: false },
//       ]);
//     }, 1000);
//   };

//   // Handle like and dislike actions
//   const handleLikeDislike = (index: number, action: 'like' | 'dislike') => {
//     const updatedMessages = [...messages];
//     if (updatedMessages[index].sender === 'ai') {
//       if (action === 'like') {
//         updatedMessages[index].liked = true; // Mark message as liked
//       } else if (action === 'dislike') {
//         updatedMessages[index].disliked = true; // Mark message as disliked
//         setSelectedMessageIndex(index); // Remember which message was disliked
//         setIsReasonModalOpen(true); // Open modal for reason
//       }
//     }
//     setMessages(updatedMessages);
//   };

//   // Handle reason submission for dislike
//   const handleSubmitReason = () => {
//     if (selectedMessageIndex !== null && dislikeReason.trim()) {
//       const updatedMessages = [...messages];
//       updatedMessages[selectedMessageIndex].dislikeReason = dislikeReason;
//       setMessages(updatedMessages);
//       setDislikeReason('');
//       setIsReasonModalOpen(false);
//     }
//   };

//   // Toggle minimize/maximize chat
//   const toggleMinimize = () => {
//     setIsChatMinimized(!isChatMinimized);
//   };

//   return (
//     <div className={`fixed bottom-16 right-8 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col transition-all ${isChatMinimized ? 'h-16' : 'h-96'}`}>
//       {/* Minimize/Maximize Button */}
//       <div className="absolute top-2 right-2">
//         <button onClick={toggleMinimize} className="text-gray-600 hover:text-gray-800">
//           {isChatMinimized ? (
//             <span className="text-2xl">⤴️</span> // Maximize icon
//           ) : (
//             <span className="text-2xl">➖</span> // Minimize icon
//           )}
//         </button>
//       </div>

//       {/* Chat Header */}
//       {!isChatMinimized && (
//         <div className="flex justify-between items-center p-4 border-b border-gray-200">
//           <span className="font-semibold text-lg">Chatbot</span>
//           <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
//             X
//           </button>
//         </div>
//       )}

//       {/* Chat Messages */}
//       {!isChatMinimized && (
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((msg, index) => (
//             <div
//               key={index}
//               className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//               onMouseEnter={() => setHoveredMessageIndex(index)} // Show like/dislike on hover
//               onMouseLeave={() => setHoveredMessageIndex(null)} // Hide like/dislike on mouse leave
//             >
//               <div className=" flex text-xs text-gray-500">{msg.time}</div>
//               <div
//                 className={`max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'} p-2 rounded-lg`}
//               >
//                 {/* Date/Time above message */}
//                 {/* <div className="text-xs text-gray-500">{msg.time}</div> */}

//                 <div className="flex items-center space-x-2">
//                   {msg.sender === 'user' ? (
//                     <AiOutlineUser className="text-xl" />
//                   ) : (
//                     <AiOutlineRobot className="text-xl" />
//                   )}
//                   <span className="text-sm">{msg.message}</span>
//                 </div>

//                 {/* Show like/dislike buttons only when hovered over the message */}
//                 {msg.sender === 'ai' && (
//                   <div className="mt-2 flex space-x-4">
//                     {/* Like Button */}
//                     {msg.liked && (
//                       <div className="flex items-center space-x-1 text-blue-500">
//                         <span>👍</span>
//                       </div>
//                     )}
//                     {/* Dislike Button */}
//                     {msg.disliked && msg.dislikeReason && (
//                       <div className="mt-2 text-xs text-red-600">
//                         <span>👎</span> <span>{msg.dislikeReason}</span>
//                       </div>
//                     )}

//                     {/* Like/Dislike buttons only shown when hovered */}
//                     {hoveredMessageIndex === index && !msg.liked && !msg.disliked && (
//                       <div className="flex space-x-4">
//                         <button
//                           onClick={() => handleLikeDislike(index, 'like')}
//                           className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
//                         >
//                           <span>👍</span>
//                         </button>
//                         <button
//                           onClick={() => handleLikeDislike(index, 'dislike')}
//                           className="flex items-center space-x-1 text-red-500 hover:text-red-700"
//                         >
//                           <span>👎</span>
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {msg.disliked && !msg.dislikeReason && (
//                   <div className="text-xs text-gray-500">Waiting for your reason...</div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Send Message Section */}
//       {!isChatMinimized && (
//         <div className="flex items-center p-4 border-t border-gray-200">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Type a message..."
//             className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
//           />
//           <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-lg">
//             Send
//           </button>
//         </div>
//       )}

//       {/* Dislike Reason Modal */}
//       {isReasonModalOpen && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//             <h3 className="text-lg font-semibold mb-4">Why did you dislike this message?</h3>
//             <textarea
//               value={dislikeReason}
//               onChange={(e) => setDislikeReason(e.target.value)}
//               rows={4}
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none mb-4"
//               placeholder="Type your reason..."
//             />
//             <div className="flex justify-between">
//               <button
//                 onClick={() => setIsReasonModalOpen(false)}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmitReason}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWindow;




// import React, { useState } from 'react';
// import { AiOutlineUser, AiOutlineRobot } from 'react-icons/ai'; // Icons for user and AI

// interface ChatMessage {
//   sender: 'user' | 'ai';
//   message: string;
//   time: string;
//   likes: number;
//   dislikes: number;
//   dislikeReason?: string;
//   liked: boolean; // New field to track if the message is liked
//   disliked: boolean; // New field to track if the message is disliked
// }

// const ChatWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState<string>('');
//   const [dislikeReason, setDislikeReason] = useState<string>('');
//   const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
//   const [isReasonModalOpen, setIsReasonModalOpen] = useState<boolean>(false);
//   const [isChatMinimized, setIsChatMinimized] = useState<boolean>(false);
//   const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);

//   // Handle user input
//   const handleSendMessage = () => {
//     if (!input.trim()) return;

//     const timeStamp = new Date().toLocaleString(); // Date and Time displayed here
//     setMessages([...messages, { sender: 'user', message: input, time: timeStamp, likes: 0, dislikes: 0, liked: false, disliked: false }]);
//     setInput('');
//     setTimeout(() => {
//       // Simulate AI response
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: 'ai', message: 'This is an AI response.', time: new Date().toLocaleString(), likes: 0, dislikes: 0, liked: false, disliked: false },
//       ]);
//     }, 1000);
//   };

//   // Handle like and dislike actions
//   const handleLikeDislike = (index: number, action: 'like' | 'dislike') => {
//     const updatedMessages = [...messages];
//     if (updatedMessages[index].sender === 'ai') {
//       if (action === 'like') {
//         updatedMessages[index].likes += 1; // Likes increase
//         updatedMessages[index].liked = true; // Mark message as liked
//       } else if (action === 'dislike') {
//         updatedMessages[index].dislikes += 1; // Dislikes increase
//         updatedMessages[index].disliked = true; // Mark message as disliked
//         setSelectedMessageIndex(index); // Remember which message was disliked
//         setIsReasonModalOpen(true); // Open modal for reason
//       }
//     }
//     setMessages(updatedMessages);
//   };

//   // Handle reason submission
//   const handleSubmitReason = () => {
//     if (selectedMessageIndex !== null && dislikeReason.trim()) {
//       const updatedMessages = [...messages];
//       updatedMessages[selectedMessageIndex].dislikeReason = dislikeReason;
//       setMessages(updatedMessages);
//       setDislikeReason('');
//       setIsReasonModalOpen(false);
//     }
//   };

//   // Toggle minimize/maximize
//   const toggleMinimize = () => {
//     setIsChatMinimized(!isChatMinimized);
//   };

//   return (
//     <div className={`fixed bottom-16 right-8 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col transition-all ${isChatMinimized ? 'h-16' : 'h-96'}`}>
//       {/* Minimize/Maximize Button */}
//       <div className="absolute top-2 right-2">
//         <button onClick={toggleMinimize} className="text-gray-600 hover:text-gray-800">
//           {isChatMinimized ? (
//             <span className="text-2xl">⤴️</span> // Maximize icon
//           ) : (
//             <span className="text-2xl">➖</span> // Minimize icon
//           )}
//         </button>
//       </div>

//       {/* Chat Header */}
//       {!isChatMinimized && (
//         <div className="flex justify-between items-center p-4 border-b border-gray-200">
//           <span className="font-semibold text-lg">Chatbot</span>
//           <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
//             X
//           </button>
//         </div>
//       )}

//       {/* Chat Messages */}
//       {!isChatMinimized && (
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((msg, index) => (
//             <div
//               key={index}
//               className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//               onMouseEnter={() => setHoveredMessageIndex(index)} // Show like/dislike on hover
//               onMouseLeave={() => setHoveredMessageIndex(null)} // Hide like/dislike on mouse leave
//             >
//               <div
//                 className={`max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'} p-2 rounded-lg`}
//               >
//                 {/* Date/Time above message */}
//                 <div className="text-xs text-gray-500">{msg.time}</div>

//                 <div className="flex items-center space-x-2">
//                   {msg.sender === 'user' ? (
//                     <AiOutlineUser className="text-xl" />
//                   ) : (
//                     <AiOutlineRobot className="text-xl" />
//                   )}
//                   <span className="text-sm">{msg.message}</span>
//                 </div>

//                 {msg.sender === 'ai' && (
//                   <div className="mt-2 flex space-x-4">
//                     {/* Like Button */}
//                     {msg.liked && (
//                       <div className="flex items-center space-x-1 text-blue-500">
//                         <span>👍</span>
//                         <span>{msg.likes}</span>
//                       </div>
//                     )}
//                     {/* Dislike Button */}
//                     {msg.disliked && msg.dislikeReason && (
//                       <div className="mt-2 text-xs text-red-600">
//                         <span>👎</span> <span>{msg.dislikeReason}</span>
//                       </div>
//                     )}
//                     {/* Show like/dislike buttons on hover */}
//                     {hoveredMessageIndex === index && !msg.liked && !msg.disliked && (
//                       <div className="flex space-x-4">
//                         <button
//                           onClick={() => handleLikeDislike(index, 'like')}
//                           className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
//                         >
//                           <span>👍</span>
//                           <span>{msg.likes}</span>
//                         </button>
//                         <button
//                           onClick={() => handleLikeDislike(index, 'dislike')}
//                           className="flex items-center space-x-1 text-red-500 hover:text-red-700"
//                         >
//                           <span>👎</span>
//                           <span>{msg.dislikes}</span>
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {msg.disliked && !msg.dislikeReason && (
//                   <div className="text-xs text-gray-500">Waiting for your reason...</div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Send Message Section */}
//       {!isChatMinimized && (
//         <div className="flex items-center p-4 border-t border-gray-200">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Type a message..."
//             className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
//           />
//           <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-lg">
//             Send
//           </button>
//         </div>
//       )}

//       {/* Dislike Reason Modal */}
//       {isReasonModalOpen && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//             <h3 className="text-lg font-semibold mb-4">Why did you dislike this message?</h3>
//             <textarea
//               value={dislikeReason}
//               onChange={(e) => setDislikeReason(e.target.value)}
//               rows={4}
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none mb-4"
//               placeholder="Type your reason..."
//             />
//             <div className="flex justify-between">
//               <button
//                 onClick={() => setIsReasonModalOpen(false)}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmitReason}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWindow;






// import React, { useState } from 'react';
// import { AiOutlineUser, AiOutlineRobot } from 'react-icons/ai'; // Icons for user and AI

// interface ChatMessage {
//   sender: 'user' | 'ai';
//   message: string;
//   time: string;
//   likes: number;
//   dislikes: number;
//   dislikeReason?: string;
// }

// const ChatWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState<string>('');
//   const [dislikeReason, setDislikeReason] = useState<string>('');
//   const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
//   const [isReasonModalOpen, setIsReasonModalOpen] = useState<boolean>(false);
//   const [isChatMinimized, setIsChatMinimized] = useState<boolean>(false);

//   // Handle user input
//   const handleSendMessage = () => {
//     if (!input.trim()) return;

//     const timeStamp = new Date().toLocaleString(); // Date and Time displayed here
//     setMessages([...messages, { sender: 'user', message: input, time: timeStamp, likes: 0, dislikes: 0 }]);
//     setInput('');
//     setTimeout(() => {
//       // Simulate AI response
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: 'ai', message: 'This is an AI response.', time: new Date().toLocaleString(), likes: 0, dislikes: 0 },
//       ]);
//     }, 1000);
//   };

//   // Handle like and dislike actions
//   const handleLikeDislike = (index: number, action: 'like' | 'dislike') => {
//     const updatedMessages = [...messages];
//     if (updatedMessages[index].sender === 'ai') {
//       if (action === 'like') {
//         updatedMessages[index].likes += 1; // Likes increase
//       } else if (action === 'dislike') {
//         updatedMessages[index].dislikes += 1; // Dislikes increase
//         setSelectedMessageIndex(index); // Remember which message was disliked
//         setIsReasonModalOpen(true); // Open modal for reason
//       }
//     }
//     setMessages(updatedMessages);
//   };

//   // Handle reason submission
//   const handleSubmitReason = () => {
//     if (selectedMessageIndex !== null && dislikeReason.trim()) {
//       const updatedMessages = [...messages];
//       updatedMessages[selectedMessageIndex].dislikeReason = dislikeReason;
//       setMessages(updatedMessages);
//       setDislikeReason('');
//       setIsReasonModalOpen(false);
//     }
//   };

//   // Toggle minimize/maximize
//   const toggleMinimize = () => {
//     setIsChatMinimized(!isChatMinimized);
//   };

//   return (
//     <div className={`fixed bottom-16 right-8 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col transition-all ${isChatMinimized ? 'h-16' : 'h-96'}`}>
//       {/* Minimize/Maximize Button */}
//       <div className="absolute top-2 right-2">
//         <button onClick={toggleMinimize} className="text-gray-600 hover:text-gray-800">
//           {isChatMinimized ? (
//             <span className="text-2xl">⤴️</span> // Maximize icon
//           ) : (
//             <span className="text-2xl">➖</span> // Minimize icon
//           )}
//         </button>
//       </div>

//       {/* Chat Header */}
//       {!isChatMinimized && (
//         <div className="flex justify-between items-center p-4 border-b border-gray-200">
//           <span className="font-semibold text-lg">Chatbot</span>
//           <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
//             X
//           </button>
//         </div>
//       )}

//       {/* Chat Messages */}
//       {!isChatMinimized && (
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((msg, index) => (
//             <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
//               <div
//                 className={`max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'} p-2 rounded-lg`}
//               >
//                 {/* Date/Time above message */}
//                 <div className="text-xs text-gray-500">{msg.time}</div>

//                 <div className="flex items-center space-x-2">
//                   {msg.sender === 'user' ? (
//                     <AiOutlineUser className="text-xl" />
//                   ) : (
//                     <AiOutlineRobot className="text-xl" />
//                   )}
//                   <span className="text-sm">{msg.message}</span>
//                 </div>

//                 {msg.sender === 'ai' && (
//                   <div className="mt-2 flex space-x-4">
//                     <button
//                       onClick={() => handleLikeDislike(index, 'like')}
//                       className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
//                     >
//                       <span>👍</span>
//                       <span>{msg.likes}</span>
//                     </button>
//                     <button
//                       onClick={() => handleLikeDislike(index, 'dislike')}
//                       className="flex items-center space-x-1 text-red-500 hover:text-red-700"
//                     >
//                       <span>👎</span>
//                       <span>{msg.dislikes}</span>
//                     </button>
//                   </div>
//                 )}

//                 {msg.dislikeReason && (
//                   <div className="mt-2 text-xs text-red-600">
//                     <strong>Reason: </strong>{msg.dislikeReason}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Send Message Section */}
//       {!isChatMinimized && (
//         <div className="flex items-center p-4 border-t border-gray-200">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Type a message..."
//             className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
//           />
//           <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-lg">
//             Send
//           </button>
//         </div>
//       )}

//       {/* Dislike Reason Modal */}
//       {isReasonModalOpen && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//             <h3 className="text-lg font-semibold mb-4">Why did you dislike this message?</h3>
//             <textarea
//               value={dislikeReason}
//               onChange={(e) => setDislikeReason(e.target.value)}
//               rows={4}
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none mb-4"
//               placeholder="Type your reason..."
//             />
//             <div className="flex justify-between">
//               <button
//                 onClick={() => setIsReasonModalOpen(false)}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmitReason}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWindow;


// import React, { useState } from 'react';
// import { AiOutlineUser, AiOutlineRobot } from 'react-icons/ai'; // Icons for user and AI

// interface ChatMessage {
//   sender: 'user' | 'ai';
//   message: string;
//   time: string;
//   likes: number;
//   dislikes: number;
//   dislikeReason?: string;
// }

// const ChatWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState<string>('');
//   const [dislikeReason, setDislikeReason] = useState<string>('');
//   const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
//   const [isReasonModalOpen, setIsReasonModalOpen] = useState<boolean>(false);
//   const [isChatMinimized, setIsChatMinimized] = useState<boolean>(false);

//   // Handle user input
//   const handleSendMessage = () => {
//     if (!input.trim()) return;

//     const timeStamp = new Date().toLocaleString(); // Date and Time displayed here
//     setMessages([...messages, { sender: 'user', message: input, time: timeStamp, likes: 0, dislikes: 0 }]);
//     setInput('');
//     setTimeout(() => {
//       // Simulate AI response
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: 'ai', message: 'This is an AI response.', time: new Date().toLocaleString(), likes: 0, dislikes: 0 },
//       ]);
//     }, 1000);
//   };

//   // Handle like and dislike actions
//   const handleLikeDislike = (index: number, action: 'like' | 'dislike') => {
//     const updatedMessages = [...messages];
//     if (updatedMessages[index].sender === 'ai') {
//       if (action === 'like') {
//         updatedMessages[index].likes += 1; // Likes increase
//       } else if (action === 'dislike') {
//         updatedMessages[index].dislikes += 1; // Dislikes increase
//         setSelectedMessageIndex(index); // Remember which message was disliked
//         setIsReasonModalOpen(true); // Open modal for reason
//       }
//     }
//     setMessages(updatedMessages);
//   };

//   // Handle reason submission
//   const handleSubmitReason = () => {
//     if (selectedMessageIndex !== null && dislikeReason.trim()) {
//       const updatedMessages = [...messages];
//       updatedMessages[selectedMessageIndex].dislikeReason = dislikeReason;
//       setMessages(updatedMessages);
//       setDislikeReason('');
//       setIsReasonModalOpen(false);
//     }
//   };

//   // Toggle minimize/maximize
//   const toggleMinimize = () => {
//     setIsChatMinimized(!isChatMinimized);
//   };

//   return (
//     <div className="h-screen flex justify-center items-center">
//       <div className={`w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col transition-all ${isChatMinimized ? 'h-16' : 'h-96'}`}>
//         {/* Minimize/Maximize Button */}
//         <div className="absolute top-2 right-2">
//           <button onClick={toggleMinimize} className="text-gray-600 hover:text-gray-800">
//             {isChatMinimized ? (
//               <span className="text-2xl">⤴️</span> // Maximize icon
//             ) : (
//               <span className="text-2xl">➖</span> // Minimize icon
//             )}
//           </button>
//         </div>

//         {/* Chat Header */}
//         {!isChatMinimized && (
//           <div className="flex justify-between items-center p-4 border-b border-gray-200">
//             <span className="font-semibold text-lg">Chatbot</span>
//             <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
//               X
//             </button>
//           </div>
//         )}

//         {/* Chat Messages */}
//         {!isChatMinimized && (
//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {messages.map((msg, index) => (
//               <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
//                 <div
//                   className={`max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'} p-2 rounded-lg`}
//                 >
//                   {/* Date/Time above message */}
//                   <div className="text-xs text-gray-500 mb-2">{msg.time}</div>

//                   <div className="flex items-center space-x-2">
//                     {msg.sender === 'user' ? (
//                       <AiOutlineUser className="text-xl" />
//                     ) : (
//                       <AiOutlineRobot className="text-xl" />
//                     )}
//                     <span className="text-sm">{msg.message}</span>
//                   </div>

//                   {msg.sender === 'ai' && (
//                     <div className="mt-2 flex space-x-4">
//                       <button
//                         onClick={() => handleLikeDislike(index, 'like')}
//                         className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
//                       >
//                         <span>👍</span>
//                         <span>{msg.likes}</span>
//                       </button>
//                       <button
//                         onClick={() => handleLikeDislike(index, 'dislike')}
//                         className="flex items-center space-x-1 text-red-500 hover:text-red-700"
//                       >
//                         <span>👎</span>
//                         <span>{msg.dislikes}</span>
//                       </button>
//                     </div>
//                   )}

//                   {msg.dislikeReason && (
//                     <div className="mt-2 text-xs text-red-600">
//                       <strong>Reason: </strong>{msg.dislikeReason}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Send Message Section */}
//         {!isChatMinimized && (
//           <div className="flex items-center p-4 border-t border-gray-200">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//               placeholder="Type a message..."
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
//             />
//             <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-lg">
//               Send
//             </button>
//           </div>
//         )}

//         {/* Dislike Reason Modal */}
//         {isReasonModalOpen && (
//           <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//               <h3 className="text-lg font-semibold mb-4">Why did you dislike this message?</h3>
//               <textarea
//                 value={dislikeReason}
//                 onChange={(e) => setDislikeReason(e.target.value)}
//                 rows={4}
//                 className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none mb-4"
//                 placeholder="Type your reason..."
//               />
//               <div className="flex justify-between">
//                 <button
//                   onClick={() => setIsReasonModalOpen(false)}
//                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmitReason}
//                   className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatWindow;
















// import React, { useState } from 'react';

// interface ChatMessage {
//   sender: 'user' | 'ai';
//   message: string;
//   time: string;
//   likes: number;
//   dislikes: number;
//   dislikeReason?: string;  // Store reason for dislike
// }

// const ChatWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState<string>('');
//   const [dislikeReason, setDislikeReason] = useState<string>('');
//   const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
//   const [isReasonModalOpen, setIsReasonModalOpen] = useState<boolean>(false);

//   // Handle user input
//   const handleSendMessage = () => {
//     if (!input.trim()) return;

//     const timeStamp = new Date().toLocaleTimeString();
//     setMessages([...messages, { sender: 'user', message: input, time: timeStamp, likes: 0, dislikes: 0 }]);
//     setInput('');
//     setTimeout(() => {
//       // Simulate AI response
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: 'ai', message: 'This is an AI response.', time: new Date().toLocaleTimeString(), likes: 0, dislikes: 0 },
//       ]);
//     }, 1000);
//   };

//   // Handle like and dislike actions
//   const handleLikeDislike = (index: number, action: 'like' | 'dislike') => {
//     const updatedMessages = [...messages];
//     if (updatedMessages[index].sender === 'ai') {
//       if (action === 'like') {
//         updatedMessages[index].likes += 1;
//       } else {
//         updatedMessages[index].dislikes += 1;
//         setSelectedMessageIndex(index); // Remember which message was disliked
//         setIsReasonModalOpen(true); // Open modal for reason
//       }
//     }
//     setMessages(updatedMessages);
//   };

//   // Handle reason submission
//   const handleSubmitReason = () => {
//     if (selectedMessageIndex !== null && dislikeReason.trim()) {
//       const updatedMessages = [...messages];
//       updatedMessages[selectedMessageIndex].dislikeReason = dislikeReason;
//       setMessages(updatedMessages);
//       setDislikeReason('');
//       setIsReasonModalOpen(false);
//     }
//   };

//   return (
//     <div className="fixed bottom-16 right-8 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col">
//       <div className="flex justify-between items-center p-4 border-b border-gray-200">
//         <span className="font-semibold text-lg">Chatbot</span>
//         <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
//           X
//         </button>
//       </div>
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((msg, index) => (
//           <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
//             <div
//               className={`max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'} p-2 rounded-lg`}
//             >
//               <p className="text-sm">{msg.message}</p>
//               <span className="text-xs text-gray-500">{msg.time}</span>
//               {msg.sender === 'ai' && (
//                 <div className="mt-2 flex space-x-4">
//                   <button
//                     onClick={() => handleLikeDislike(index, 'like')}
//                     className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
//                   >
//                     <span>👍</span>
//                     <span>{msg.likes}</span>
//                   </button>
//                   <button
//                     onClick={() => handleLikeDislike(index, 'dislike')}
//                     className="flex items-center space-x-1 text-red-500 hover:text-red-700"
//                   >
//                     <span>👎</span>
//                     <span>{msg.dislikes}</span>
//                   </button>
//                 </div>
//               )}
//               {msg.dislikeReason && (
//                 <div className="mt-2 text-xs text-red-600">
//                   <strong>Reason: </strong>{msg.dislikeReason}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="flex items-center p-4 border-t border-gray-200">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//           placeholder="Type a message..."
//           className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
//         />
//         <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-lg">
//           Send
//         </button>
//       </div>

//       {/* Dislike Reason Modal */}
//       {isReasonModalOpen && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//             <h3 className="text-lg font-semibold mb-4">Why did you dislike this message?</h3>
//             <textarea
//               value={dislikeReason}
//               onChange={(e) => setDislikeReason(e.target.value)}
//               rows={4}
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none mb-4"
//               placeholder="Type your reason..."
//             />
//             <div className="flex justify-between">
//               <button
//                 onClick={() => setIsReasonModalOpen(false)}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmitReason}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWindow;
