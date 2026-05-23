import React, { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { IoSearch, IoAdd, IoMenuOutline, IoCameraOutline, IoRefreshOutline } from "react-icons/io5";

const Chatlist = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("Chats");

  // Pull-to-refresh states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data()?.chats || [];

        const promises = items.map(async (item) => {
          if (!item.receiverId) return null;

          try {
            const userDocRef = doc(db, "users", item.receiverId);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
              console.log(`No user found for receiverId: ${item.receiverId}`);
              return null;
            }

            const user = userDocSnap.data();
            return { ...item, user };
          } catch (error) {
            console.log(
              `Error fetching user with receiverId: ${item.receiverId}`,
              error
            );
            return null;
          }
        });

        const chatData = await Promise.all(promises);
        setChats(
          chatData.filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt)
        );
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    // 1. Instantly switch chat and update store so UI responds immediately
    changeChat(chat.chatId, chat.user);

    // 2. Mark chat as seen in firestore in background
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
    if (chatIndex !== -1 && !userChats[chatIndex].isSeen) {
      userChats[chatIndex].isSeen = true;

      const userChatsRef = doc(db, "userchats", currentUser.id);

      try {
        updateDoc(userChatsRef, {
          chats: userChats,
        }).catch((err) => {
          console.error("Error updating seen state in background:", err);
        });
      } catch (err) {
        console.error("Error setting up seen update:", err);
      }
    }
  };

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    setPullDistance(50); // Keep it visible at 50px height during reload

    try {
      if (currentUser?.id) {
        await useUserStore.getState().fetchUserInfo(currentUser.id);
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  const handleManualRefresh = (e) => {
    e.stopPropagation();
    if (!isRefreshing) {
      triggerRefresh();
    }
  };

  const handleTouchStart = (e) => {
    const container = e.currentTarget;
    if (container.scrollTop === 0 && !isRefreshing) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (startY === 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0) {
      const distance = Math.min(diff * 0.4, 80);
      setPullDistance(distance);
      if (diff > 10 && e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (startY === 0 || isRefreshing) return;
    setStartY(0);

    if (pullDistance > 55) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      {/* Chattie Mockup Header */}
      <div className="listHeader">
        <IoMenuOutline className="headerIcon" />
        <h1 className="logoText">Chattie</h1>
        <div className="headerIcons">
          <IoRefreshOutline 
            className={`headerIcon ${isRefreshing ? "spin-animation" : ""}`} 
            onClick={handleManualRefresh}
            title="Refresh Chats"
          />
          <IoCameraOutline className="headerIcon" />
        </div>
      </div>

      {/* Tabs list matching the mockup */}
      <div className="listTabs">
        {["Chats", "Status", "Calls"].map((tab) => (
          <button
            key={tab}
            className={`tabButton ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Recent Chats Section */}
      <div className="sectionHeader">
        <h2>Recent Chats</h2>
        <div className="searchBarContainer">
          <IoSearch className="searchIcon" />
          <input
            type="text"
            placeholder="Search chats..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
      </div>

      {/* Chats Container */}
      <div 
        className="itemsContainer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to refresh indicator */}
        <div 
          className="pullToRefresh"
          style={{ 
            height: `${pullDistance}px`, 
            opacity: pullDistance > 0 ? 1 : 0,
            transition: isRefreshing ? "none" : "height 0.2s ease, opacity 0.2s ease"
          }}
        >
          <div className={`refreshContent ${isRefreshing ? "refreshing" : ""}`}>
            {isRefreshing ? (
              <div className="refreshSpinner"></div>
            ) : pullDistance > 50 ? (
              <span>Release to refresh</span>
            ) : (
              <span>Pull to refresh</span>
            )}
          </div>
        </div>

        {filteredChats.length === 0 ? (
          <div className="emptyState">No conversations found</div>
        ) : (
          filteredChats.map((chat) => {
            const isUnread = !chat.isSeen;
            const isBlocked = chat.user.blocked.includes(currentUser.id);
            const displayName = isBlocked ? "User" : chat.user.username;
            const displayAvatar = isBlocked ? "./avatar.png" : chat.user?.avatar || "./avatar.png";

            return (
              <div
                className={`item ${chatId === chat.chatId ? "selected" : ""} ${isUnread ? "unread" : ""}`}
                key={chat.chatId}
                onClick={() => handleSelect(chat)}
              >
                <PhotoProvider>
                  <PhotoView src={displayAvatar}>
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="userAvatar"
                      onClick={(e) => e.stopPropagation()} // Prevent selecting the chat when viewing photo
                    />
                  </PhotoView>
                </PhotoProvider>
                
                <div className="texts">
                  <span className="username">{displayName}</span>
                  <p className="lastMessage">
                    {chat.lastMessage || "No messages yet"}
                  </p>
                </div>

                <div className="metaInfo">
                  <span className="time">
                    {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                  {isUnread && (
                    <div className="unreadBadge">1</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) at bottom-right of list */}
      <button 
        className={`fabButton ${addMode ? "active" : ""}`}
        onClick={() => setAddMode((prev) => !prev)}
        title="Add User"
      >
        <IoAdd />
      </button>

      {addMode && <AddUser onClose={() => setAddMode(false)} />}
    </div>
  );
};

export default Chatlist;
