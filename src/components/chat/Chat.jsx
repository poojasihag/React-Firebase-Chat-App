import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { db } from "../../lib/firebase";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { IoSend, IoChevronBack, IoCallOutline, IoVideocamOutline, IoEllipsisHorizontal, IoImageOutline } from "react-icons/io5";
import { MdBlock } from "react-icons/md";

const Chat = ({ toggleDetail, showDetail }) => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const {
    changeChat,
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlocked,
  } = useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages, img.url]);

  useEffect(() => {
    setChat(undefined); // Clear old chat messages immediately when chatId changes!
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

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

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (!text && !img.file) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file, { maxSize: 600, quality: 0.6 });
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: text || null,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text || "Sent an image";
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
    }

    setImg({
      file: null,
      url: "",
    });
    setText("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const convertTimestampToDate = (timestamp) => {
    if (!timestamp) return "";
    const milliseconds = timestamp.seconds ? timestamp.seconds * 1000 : timestamp;
    const dateObject = new Date(milliseconds);
    const today = new Date();

    const isToday =
      dateObject.getDate() === today.getDate() &&
      dateObject.getMonth() === today.getMonth() &&
      dateObject.getFullYear() === today.getFullYear();

    const timeOptions = { hour: "2-digit", minute: "2-digit" };
    const dateTimeOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return isToday
      ? dateObject.toLocaleTimeString([], timeOptions)
      : dateObject.toLocaleDateString([], dateTimeOptions);
  };

  const handleBack = () => {
    changeChat(null, null);
  };

  return (
    <div className="chat">
      {/* Top Bar (Header) */}
      <div className="top">
        <button className="backBtn" onClick={handleBack}>
          <IoChevronBack />
        </button>

        <div className="user">
          <PhotoProvider>
            <PhotoView src={user?.avatar || "./avatar.png"}>
              <img src={user?.avatar || "./avatar.png"} alt={user?.username} />
            </PhotoView>
          </PhotoProvider>
          <div className="texts">
            <span>{user?.username}</span>
            <p className="status">
              {isCurrentUserBlocked ? "" : isReceiverBlocked ? "Blocked" : "Online"}
            </p>
          </div>
        </div>

        <div className="icons">
          <IoCallOutline className="headerIcon" />
          <IoVideocamOutline className="headerIcon" />
          
          <button 
            className={`blockBtn ${isReceiverBlocked ? "blocked" : ""}`}
            onClick={handleBlock}
            title={isReceiverBlocked ? "Unblock User" : "Block User"}
          >
            <MdBlock />
          </button>

          <button 
            className={`infoBtn ${showDetail ? "active" : ""}`}
            onClick={toggleDetail}
            title="Chat Info"
          >
            <IoEllipsisHorizontal />
          </button>
        </div>
      </div>

      {/* Main Message Viewport with curved top edge nesting inside container */}
      <div className="messageViewport">
        <PhotoProvider>
          <div className="center">
            {chat === undefined ? (
              <div className="chatSkeletonList">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`chatSkeletonItem ${i % 2 === 0 ? "own" : ""}`}>
                    {i % 2 !== 0 && <div className="skeletonAvatar"></div>}
                    <div className="skeletonTexts">
                      <div className="skeletonBubble"></div>
                      <div className="skeletonTime"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {chat?.messages?.map((message, index) => {
                  const isOwn = message.senderId === currentUser?.id;
                  return (
                    <div
                      className={`message ${isOwn ? "own" : ""}`}
                      key={message.id || index}
                    >
                      {!isOwn && (
                        <img 
                          src={user?.avatar || "./avatar.png"} 
                          alt="Avatar" 
                          className="messageAvatar"
                        />
                      )}
                      <div className="texts">
                        {message.img && (
                          <PhotoView src={message.img}>
                            <img src={message.img} alt="Sent image" className="sentImage" />
                          </PhotoView>
                        )}
                        {message.text && <p className="bubble">{message.text}</p>}
                        <span className="timestamp">
                          {convertTimestampToDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {img.url && (
                  <div className="message own">
                    <div className="texts">
                      <img src={img.url} alt="Uploading..." className="sentImage uploading" />
                      <span className="timestamp">Sending...</span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="statusAlert" ref={endRef}>
              {(isCurrentUserBlocked || isReceiverBlocked) && (
                <span className="alertText">
                  {isCurrentUserBlocked 
                    ? "You cannot message this user because they blocked you." 
                    : "You have blocked this user. Unblock to resume chat."}
                </span>
              )}
            </div>
          </div>
        </PhotoProvider>

        {/* Input area at bottom of white viewport */}
        <div className="bottom">
          <div className="inputControls">
            <label htmlFor="file" className="attachLabel" title="Send Image">
              <IoImageOutline className="attachIcon" />
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleImg}
              disabled={isCurrentUserBlocked || isReceiverBlocked || chat === undefined}
              accept="image/*"
            />
          </div>

          <input
            type="text"
            placeholder={
              chat === undefined
                ? "Loading chat..."
                : isCurrentUserBlocked || isReceiverBlocked
                ? "You cannot send messages."
                : "Type a message..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked || chat === undefined}
            onKeyDown={handleKeyDown}
            className="messageInput"
          />

          <div className="emojiWrapper">
            <img 
              src="./emoji.png" 
              onClick={() => {
                if (chat !== undefined) setOpen((prev) => !prev);
              }} 
              alt="Emoji Picker"
              className="emojiTrigger"
              style={{ 
                opacity: chat === undefined ? 0.5 : 1, 
                cursor: chat === undefined ? "not-allowed" : "pointer" 
              }}
            />
            {open && chat !== undefined && (
              <div className="pickerContainer">
                <EmojiPicker
                  open={open}
                  onEmojiClick={handleEmoji}
                  width={280}
                  height={350}
                />
              </div>
            )}
          </div>

          <button
            className="sendButton"
            onClick={handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked || chat === undefined || (!text && !img.file)}
          >
            <IoSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
