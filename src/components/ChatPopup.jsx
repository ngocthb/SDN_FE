import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import socket from '../config/socket';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatThunk } from '../redux/features/chat/chatThunk';
import { addChat } from '../redux/features/chat/chatSlice';
function ChatPopup({ isOpen, onClose }) {

    const [message, setMessage] = useState('');

    const messagesEndRef = useRef(null);
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const dispatch = useDispatch();
    const { chats, loading, error } = useSelector((state) => state.chat);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);


    useEffect(() => {
        if (isOpen) {
            handleGetChats();
        }
    }, [isOpen]);

    const handleGetChats = async () => {

        socket.emit('join_room', userId);
        await dispatch(fetchChatThunk());

    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chats]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        socket.emit("send_message", {
            userId,
            message,
        });
        setMessage('');

    };


    useEffect(() => {
        const handleReceiveMessage = (data) => {
            dispatch(addChat(data));

        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [dispatch, chats]);

    const typingTimeout = useRef(null);

    const handleTypingInput = (e) => {

        setMessage(e.target.value);

        const chatId = chats[0]?.chatId;
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
        const handleTyping = ({ userName }) => {
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
    }, []);


    const handleClose = () => {
        setMessage('');
        onClose();
    };

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={handleClose}
            ></div>

            {/* Chat Popup */}
            <div className="relative w-96 h-[500px] glass-card rounded-2xl overflow-hidden animate-slide-up glow-effect shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-white/20 flex items-center bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                    <img
                        src={"https://img.freepik.com/premium-vector/abstract-medical-facility-patient-avatar-icon_71609-8596.jpg?w=2000"}
                        alt="coach"
                        className="w-10 h-10 rounded-full ring-2 ring-purple-400/50"
                    />
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-white">
                            Coach
                        </h3>
                        <p className="text-xs text-white/60 flex items-center">

                            Chat with your coach
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/70 hover:text-white"
                    >
                        ✕
                    </button>
                </div>



                {/* Messages */}
                <div className="flex-1 overflow-y-auto pt-24 px-4 space-y-3 h-[340px]">
                    {chats.map((msg, index) => (
                        <div
                            key={msg._id}
                            className={`flex animate-slide-in ${msg.senderId._id === userId ? 'justify-end' : 'justify-start'}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div
                                className={`max-w-[250px] px-3 py-2 rounded-2xl shadow-lg text-sm break-words ${msg.senderId._id === userId
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'bg-white/20 backdrop-blur-md border border-white/30 text-white'
                                    }`}
                            >
                                <p className="break-words">{msg.message}</p>
                                <p className={`text-xs mt-1 ${msg.senderId._id === userId ? 'text-white/80' : 'text-white/60'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                        </div>

                    ))}
                    {isTyping && typingUser && (
                        <div className="text-xs text-white/70 italic animate-pulse ml-2 z-50">
                            {typingUser} is typing...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t mt-5 border-white/20 bg-white/5">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            value={message}
                            onChange={handleTypingInput}

                            placeholder="Type a message..."
                            className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 text-sm ${!message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg shadow-purple-500/25'}`}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatPopup;
