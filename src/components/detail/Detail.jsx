import React, { useState } from "react";
import "./detail.css";
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { IoCloseOutline, IoChevronDownOutline, IoChevronUpOutline, IoDownloadOutline, IoLogOutOutline } from "react-icons/io5";

const Detail = ({ onClose }) => {
  const {
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlocked,
  } = useChatStore();
  const { currentUser } = useUserStore();

  const [expandedSection, setExpandedSection] = useState("photos");

  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlocked();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="detail">
      {/* Detail Header */}
      <div className="detailHeader">
        <h3>User Info</h3>
        <IoCloseOutline className="closeIcon" onClick={onClose} />
      </div>

      {/* User profile details */}
      <div className="userProfile">
        <PhotoProvider>
          <PhotoView src={user?.avatar || "./avatar.png"}>
            <img src={user?.avatar || "./avatar.png"} alt={user?.username} className="userAvatar" />
          </PhotoView>
        </PhotoProvider>
        <h2>{user?.username}</h2>
        <p className="bio">Hello there! I'm using Chattie.</p>
      </div>

      {/* Options Accordion */}
      <div className="optionsList">
        {/* Settings Option */}
        <div className="optionItem">
          <div className="optionTitle" onClick={() => toggleSection("settings")}>
            <span>Chat Settings</span>
            {expandedSection === "settings" ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
          </div>
          {expandedSection === "settings" && (
            <div className="optionContent">
              <p>Mute notifications</p>
              <p>Change chat theme</p>
            </div>
          )}
        </div>

        {/* Privacy Option */}
        <div className="optionItem">
          <div className="optionTitle" onClick={() => toggleSection("privacy")}>
            <span>Privacy & Help</span>
            {expandedSection === "privacy" ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
          </div>
          {expandedSection === "privacy" && (
            <div className="optionContent">
              <p>Report user</p>
              <p>Clear chat history</p>
            </div>
          )}
        </div>

        {/* Shared Photos Option */}
        <div className="optionItem">
          <div className="optionTitle" onClick={() => toggleSection("photos")}>
            <span>Shared Photos</span>
            {expandedSection === "photos" ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
          </div>
          
          {expandedSection === "photos" && (
            <div className="photosGrid">
              <div className="photoRow">
                <div className="photoDetail">
                  <img src="https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=100&auto=format&fit=crop" alt="shared" />
                  <span>nature_pic.jpg</span>
                </div>
                <IoDownloadOutline className="downloadIcon" />
              </div>

              <div className="photoRow">
                <div className="photoDetail">
                  <img src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=100&auto=format&fit=crop" alt="shared" />
                  <span>scenery.png</span>
                </div>
                <IoDownloadOutline className="downloadIcon" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer controls (Block and Logout buttons) */}
      <div className="footerControls">
        <button 
          onClick={handleBlock} 
          className={`blockBtn ${isReceiverBlocked ? "blocked" : ""}`}
        >
          {isCurrentUserBlocked
            ? "You are Blocked"
            : isReceiverBlocked
            ? "Unblock User"
            : "Block User"}
        </button>

        <button className="logoutBtn" onClick={() => auth.signOut()}>
          <IoLogOutOutline className="logoutIcon" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
