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
import { MdBlock } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import { IoMdArrowRoundBack } from "react-icons/io";

const Chat = () => {
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
  }, [chat, img]);
  console.log(chat);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      console.log(res.data());

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
      console.log("changeBlock", isReceiverBlocked, isCurrentUserBlocked);
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
        // Upload the image and get the URL
        imgUrl = await upload(img.file);
      }

      // Update the chat document in Firestore
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: text || null, // If there's no text, just send an empty string
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }), // Only include the image if there's a URL
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          console.log(userChatsData);

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
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
    // Convert seconds to milliseconds
    const milliseconds = timestamp.seconds * 1000;
    // Create a Date object
    const dateObject = new Date(milliseconds);

    // Create a Date object for today
    const today = new Date();

    // Check if the message is from today
    const isToday =
      dateObject.getDate() === today.getDate() &&
      dateObject.getMonth() === today.getMonth() &&
      dateObject.getFullYear() === today.getFullYear();

    // Options to format the time (removes seconds)
    const timeOptions = { hour: "2-digit", minute: "2-digit" };

    // Options to format date and time
    const dateTimeOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    // If it's today, show only the time, otherwise show the date and time
    return isToday
      ? dateObject.toLocaleTimeString([], timeOptions)
      : dateObject.toLocaleDateString([], dateTimeOptions);
  };
  const handleBack = () => {
    changeChat(null, null); // Reset chatId to go back to the list
  };
  return (
    <>
      <div className="chat">
        <div className="top">
        <button className="block lg:hidden" onClick={handleBack} >
        <IoMdArrowRoundBack />

        </button>
          <div className="user">
            <PhotoProvider>
              <PhotoView src={user?.avatar || "./avatar.png"}>
                <img src={user?.avatar || "./avatar.png"} />
              </PhotoView>
            </PhotoProvider>
            <div className="texts">
              <span>{user?.username}</span>
              <p></p>
            </div>
          </div>
          <div className="icons">
            <img src="./phone.png" />
            <img src="./video.png" />
            {
              <MdBlock
                className={`${
                  isReceiverBlocked ? "text-red-500" : "text-white"
                } w-6 h-6`}
                onClick={handleBlock}
              >
                {isCurrentUserBlocked
                  ? "You are Blocked"
                  : isReceiverBlocked
                  ? "User Blocked"
                  : "Block User"}
              </MdBlock>
            }
          </div>
        </div>
        <PhotoProvider>
          <div className="center">
            {chat?.messages?.map((message, index) => (
              <div
                className={
                  message.senderId === currentUser?.id
                    ? "message own"
                    : "message"
                }
                key={message.id || index}
              >
                <div className="texts">
                  {message.img && (
                    <>
                      <PhotoView src={message.img}>
                        <img src={message.img} />
                      </PhotoView>
                    </>
                  )}
                  {message.text !== null && <p>{message.text}</p>}
                  <span>{convertTimestampToDate(message.createdAt)}</span>{" "}
                </div>
              </div>
            ))}

            {img.url && (
              <div className="message own">
                <div className="texts">
                  <img src={img.url} />
                </div>
              </div>
            )}
            <div className="text-center" ref={endRef}>
              {" "}
              {isCurrentUserBlocked ||
                (isReceiverBlocked && (
                  <span className="p-1 bg-slate-500 border-slate-500  text-white rounded-lg">
                    You are blocked
                  </span>
                ))}{" "}
            </div>
          </div>
        </PhotoProvider>
        <div className="bottom">
          <div className="icons">
            <label htmlFor="file">
              <img className="camara" src="./img.png" />
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleImg}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
            />
            <img className="camara" src="./camera.png" />
            <div className="voicer">
              <img className="mic" src="./mic.png" />
            </div>
            {/* <div>
    <ReactMediaRecorder
      audio
      render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
        <div>
          <p>{status}</p>
          <button onClick={startRecording}>Start Recording</button>
          <button onClick={stopRecording}>Stop Recording</button>
          <audio src={mediaBlobUrl} controls autoPlay loop />
        </div>
      )}
    />
  </div> */}
          </div>
          <input
            type="text"
            placeholder={
              isCurrentUserBlocked || isReceiverBlocked
                ? "You cannot send a message."
                : "Type a message..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            onKeyDown={handleKeyDown}
          />
          <div className="emoji">
            <img src="./emoji.png" onClick={() => setOpen((prev) => !prev)} />
            <div className="picker">
              <EmojiPicker
                open={!(isCurrentUserBlocked || isReceiverBlocked) && open}
                onEmojiClick={handleEmoji}
              />
            </div>
          </div>
          <button
            className="sendButton hidden lg:block"
            onClick={handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          >
            Send

          </button>
          <button
            className="sendButton block lg:hidden"
            onClick={handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          >
            <IoSend />


          </button>
        </div>
      </div>
    </>
  );
};

export default Chat;
