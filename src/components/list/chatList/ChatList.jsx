import React, { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { PhotoProvider, PhotoView } from "react-photo-view";

const Chatlist = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();
  // console.log("checking chatId"+chatId);

  // Old code dont delete we will review it evening
  // useEffect(() => {
  //   const unSub = onSnapshot(
  //     doc(db, "userchats", currentUser.id),
  //     async (res) => {
  //       const items = res.data().chats;

  //       const promises = items.map(async (item) => {
  //         const userDocRef = doc(db, "users", item.reseiverId);
  //         const userDocSnap = await getDoc(userDocRef);

  //         const user = userDocSnap.data();

  //         return { ...item, user };
  //       });

  //       const chatData = await Promise.all(promises);

  //       setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
  //     }
  //   );

  //   return () => {
  //     unSub();
  //   };
  // }, [currentUser.id]);

  console.log(chats);

  useEffect(() => {
    if (!currentUser?.id) return; // Ensure currentUser is loaded

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data()?.chats || []; // Handle undefined chats

        const promises = items.map(async (item) => {
          if (!item.receiverId) return null; // Ensure receiverId exists

          try {
            const userDocRef = doc(db, "users", item.receiverId);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
              console.log(`No user found for receiverId: ${item.receiverId}`);
              return null; // Handle case where no user exists
            }

            const user = userDocSnap.data();

            return { ...item, user };
          } catch (error) {
            console.log(
              `Error fetching user with receiverId: ${item.receiverId}`,
              error
            );
            return null; // Handle Firestore errors gracefully
          }
        });

        const chatData = await Promise.all(promises);

        setChats(
          chatData.filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt)
        ); // Filter out null results
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = IIRFilterNode;
      return rest;
    });
    console.log("chatprint" + chat);

    changeChat(chat.chatId, chat.user);
  };

  const filteredChats = chats.filter((C) =>
    C.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          
          <img src="./search.png" />
         
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <PhotoProvider>
          <PhotoView  src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user?.avatar || "./avatar.png"
            }>
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user?.avatar || "./avatar.png"
            }
          />
           </PhotoView>
           </PhotoProvider>
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default Chatlist;
