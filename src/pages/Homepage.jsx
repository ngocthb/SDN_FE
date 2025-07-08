import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ChatPopup from "../components/ChatPopup";
import {
  IoChatbubbleEllipsesOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoChatbubblesSharp,
  IoSettingsOutline,
  IoAddCircleOutline,
  IoArrowForwardSharp,
} from "react-icons/io5";
import RatingPage from "../components/Rating";

function Homepage() {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const stats = [
    {
      label: "Messages Sent",
      value: "1,234",
      icon: <IoChatbubbleEllipsesOutline />,
      gradient: "from-blue-500 to-purple-500",
    },
    {
      label: "Active Chats",
      value: "12",
      icon: <IoPeopleOutline />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Days Active",
      value: "45",
      icon: <IoCalendarOutline />,
      gradient: "from-pink-500 to-orange-500",
    },
  ];

  const recentChats = [
    {
      id: 1,
      name: "Alice Johnson",
      lastMessage: "Hey, how are you doing?",
      time: "2 min ago",
      avatar:
        "https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      unread: 2,
      status: "online",
    },
    {
      id: 2,
      name: "Bob Smith",
      lastMessage: "Let's meet tomorrow for lunch",
      time: "1 hour ago",
      avatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      unread: 0,
      status: "offline",
    },
    {
      id: 3,
      name: "Carol Williams",
      lastMessage: "Thanks for your help!",
      time: "3 hours ago",
      avatar:
        "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      unread: 1,
      status: "online",
    },
  ];

  const quickActions = [
    {
      title: "Start New Chat",
      description: "Begin a conversation with someone",
      icon: <IoChatbubblesSharp />,
      gradient: "from-blue-500 to-purple-500",
      link: "/messenger",
    },
    {
      title: "Create Group",
      description: "Start a group conversation",
      icon: <IoPeopleOutline />,
      gradient: "from-purple-500 to-pink-500",
      link: "#",
    },
    {
      title: "Settings",
      description: "Manage your preferences",
      icon: <IoSettingsOutline />,
      gradient: "from-pink-500 to-orange-500",
      link: "#",
    },
  ];

  const handleChatClick = (contact) => {
    setSelectedContact(contact);
    setIsChatOpen(true);
  };

  const handleCloseChatPopup = () => {
    setIsChatOpen(false);
    setSelectedContact(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">{user?.name}</span>!
          </h1>
          <p className="text-white/70 text-lg">
            Stay connected with your friends and colleagues
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="floating-card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center text-2xl shadow-lg text-white`}
                >
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Chats */}
          <div className="glass-card p-6 animate-slide-up glow-effect">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <IoChatbubbleEllipsesOutline /> Recent Chats
              </h2>
              <Link
                to="/messenger"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-4">
              {recentChats.map((chat, index) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="flex items-center p-4 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full ring-2 ring-purple-400/50"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-800 ${
                        chat.status === "online"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    />
                    {chat.unread > 0 && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                      {chat.name}
                    </p>
                    <p className="text-sm text-white/60 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  <div className="text-xs text-white/40">{chat.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6 animate-slide-up glow-effect">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Quick Actions ⚡
            </h2>

            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="flex items-center p-4 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300 group animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}
                  >
                    {action.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-white/60">
                      {action.description}
                    </p>
                  </div>
                  <div className="ml-auto text-white/40 group-hover:text-white/60 transition-colors">
                    <IoArrowForwardSharp />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Chat Button */}
        <button
          onClick={() => handleChatClick(recentChats[0])}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-3xl z-40 animate-float glow-effect"
        >
          <IoChatbubblesSharp />
        </button>
      </div>

      <ChatPopup isOpen={isChatOpen} onClose={handleCloseChatPopup} />
      <RatingPage />
    </div>
  );
}

export default Homepage;
