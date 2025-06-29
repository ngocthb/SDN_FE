import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllChatsThunk, fetchChatByIdThunk } from '../redux/features/coach/coachThunk';
import socket from '../config/socket';
import { addCurrentMessage } from '../redux/features/coach/coachSlice';
import { IoChatbubbleEllipsesOutline, IoMailOpenOutline, IoChatboxEllipsesOutline } from 'react-icons/io5';

function Messenger() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({});
  const messagesEndRef = useRef(null);
  const loginUserId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const dispatch = useDispatch();
  const { chats, currentChat, currentChatMessages, loading, error } = useSelector((state) => state.coach);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);


  useEffect(() => {
    dispatch(fetchAllChatsThunk());
  }, [dispatch, currentChatMessages]);




  const handleSelected = async (chat) => {
    setSelectedChat(chat);
    socket.emit('join_room', chat.userId._id);
    await dispatch(fetchChatByIdThunk(chat._id));

  }

  useEffect(() => {
    if (currentChatMessages?.length) {
      setMessages(currentChatMessages);
    }
  }, [currentChatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    const receiveId = selectedChat?.userId?._id;
    socket.emit("send_message_by_coach", {
      receiveId,
      message,
    })
    setMessage('');
  };

  useEffect(() => {
    const handleReceiveMessage = async (data) => {
      await dispatch(fetchAllChatsThunk());
      if (data.senderId._id !== selectedChat?.userId?._id) return;
      dispatch(addCurrentMessage(data));
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [dispatch, selectedChat]); // chỉ cần `selectedChat` là dependency


  const typingTimeout = useRef(null);

  const handleTypingInput = (e) => {

    setMessage(e.target.value);

    const chatId = selectedChat?._id;
    console.log(chatId);
    if (!chatId) return;

    socket.emit("typing", {
      chatId,
      userName,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { chatId });
    }, 1000);
  };


  useEffect(() => {
    const handleTyping = ({ userName, chatId }) => {
      if (selectedChat?._id !== chatId) return;
      setTypingUser(userName || 'Someone');
      setIsTyping(true);
    };

    const handleStopTyping = () => {
      setTypingUser(null);
      setIsTyping(false);
    };

    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [selectedChat]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
      <Navbar />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Contact List */}
        <div className="w-80 glass-card m-4 mr-2 flex flex-col rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className='flex items-center gap-4 mb-4'>
              <h2 className="text-xl font-semibold text-white">Messages </h2>
              <IoChatbubbleEllipsesOutline className="text-2xl" />

            </div>
            <p className="text-white/60 text-sm mt-1">Stay connected with everyone</p>
          </div>

          {chats?.length > 0 ? (
            <div className="flex-1 overflow-y-auto p-4">
              {chats.map((chat, index) => (
                <div
                  key={chat._id}
                  onClick={() => handleSelected(chat)}
                  className={`flex items-center p-4 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300 mb-2 animate-slide-in ${selectedChat?._id === chat._id ? 'bg-white/20 shadow-lg' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <img
                      src={chat?.userId?.picture}
                      alt={chat?.userId?.name}
                      className="w-12 h-12 rounded-full ring-2 ring-purple-400/50"
                    />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {chat?.userId?.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/60 truncate">
                        {chat.latestMessage.message}
                      </p>
                      <p className="text-xs text-white/60">
                        {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {selectedChat?._id === chat._id && (
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center animate-fade-in">
                <div className="text-xl mb-4 animate-float flex justify-center items-center"><p>No chat yet</p> <IoMailOpenOutline className='ml-4 text-4xl' /></div>
              </div>
            </div>
          )}

        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col m-4 ml-2">
          {selectedChat ? (
            <div className="glass-card flex-1 flex flex-col rounded-2xl overflow-hidden glow-effect">
              {/* Chat Header */}
              <div className="p-6 border-b border-white/20 flex items-center">
                <img
                  src={selectedChat?.userId?.picture}
                  alt={selectedChat?.userId?.name}
                  className="w-12 h-12 rounded-full ring-2 ring-purple-400/50"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">
                    {selectedChat?.userId?.name}
                  </h3>
                  <p className="text-sm text-white/60 flex items-center">

                    {selectedChat?.userId?.email}
                  </p>
                </div>

              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentChatMessages?.map((msg, index) => (
                  <div
                    key={msg._id}
                    className={`flex animate-slide-in ${loginUserId === msg.senderId._id ? 'justify-end' : 'justify-start'}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${loginUserId === msg.senderId._id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/20 backdrop-blur-md border border-white/30 text-white'
                        }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-2 ${loginUserId === msg.senderId._id ? 'text-white/80' : 'text-white/60'
                        }`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && typingUser && (
                  <div className="text-xs text-white/70 italic animate-pulse ml-2">
                    {typingUser} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-white/20">
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                  <input
                    type="text"
                    value={message}
                    onChange={handleTypingInput}
                    placeholder="Type a message... "
                    className="flex-1 input-glass"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className={`gradient-button ${!message.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* No Chat Selected */
            <div className="glass-card flex-1 flex items-center justify-center rounded-2xl">
              <div className="text-center animate-fade-in">
                <div className="flex text-8xl mb-6 animate-float justify-center items-center"><IoChatboxEllipsesOutline /></div>
                <h3 className="text-2xl font-medium text-white mb-4 gradient-text">
                  Select a conversation
                </h3>
                <p className="text-white/60 text-lg">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messenger;