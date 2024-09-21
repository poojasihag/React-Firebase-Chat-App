import React, { useState } from "react";
import "./addUser.css";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../../lib/userStore";
import { useLoader } from "../../../../lib/LoaderProvider";

const AddUser = () => {
  const [user, setUser] = useState(null);

  // const { currentUser } = useUserStore(null);
  const { currentUser } = useUserStore((state) => state);
  const { showLoader, hideLoader } = useLoader();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    
    try {
      showLoader()
      const userRef = collection(db, "users");
      
      // Query the database for users with the given username, excluding the current user
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);
  
      if (!querySnapShot.empty) {
        const foundUser = querySnapShot.docs[0].data();
        
        // Check if the found user is not the current user
        if (foundUser.id !== currentUser.id) {
          setUser(foundUser); // Only set if it's not the current user
        } else {
          setUser(null); // Don't show the current user in the result
          console.log("Cannot add yourself.");
        }
      }
    } catch (error) {
      console.log(error);
    }finally{
      hideLoader()
    }
  };
  
  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
    console.log(chatRef);
    console.log(userChatsRef);

    try {
      const newChatRef = doc(chatRef);
      console.log(newChatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
      console.log(newChatRef.id);

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
