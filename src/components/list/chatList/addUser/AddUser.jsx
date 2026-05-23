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
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { toast } from "react-toastify";

const AddUser = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { currentUser } = useUserStore();
  const { showLoader, hideLoader } = useLoader();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username").trim();
    
    if (!username) return;

    try {
      showLoader();
      setHasSearched(true);
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);
  
      if (!querySnapShot.empty) {
        const foundUser = querySnapShot.docs[0].data();
        if (foundUser.id !== currentUser.id) {
          setUser(foundUser);
        } else {
          setUser(null);
          toast.warning("Cannot add yourself.");
        }
      } else {
        setUser(null);
        toast.info("No user found.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Search failed: " + error.message);
    } finally {
      hideLoader();
    }
  };
  
  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      showLoader();
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

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

      toast.success("Friend added successfully!");
      if (onClose) onClose();
    } catch (error) {
      console.log(error);
      toast.error("Failed to add friend: " + error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="addUserBackdrop" onClick={onClose}>
      <div className="addUserCard" onClick={(e) => e.stopPropagation()}>
        <div className="cardHeader">
          <h3>Add New Friend</h3>
          <IoCloseOutline className="closeIcon" onClick={onClose} />
        </div>

        <form onSubmit={handleSearch} className="searchForm">
          <div className="searchInputWrapper">
            <IoSearchOutline className="inputSearchIcon" />
            <input type="text" placeholder="Search by username..." name="username" required />
          </div>
          <button type="submit" className="searchButton">Search</button>
        </form>

        <div className="resultArea">
          {user ? (
            <div className="foundUserRow">
              <div className="userDetail">
                <img src={user.avatar || "./avatar.png"} alt={user.username} className="userAvatar" />
                <span className="username">{user.username}</span>
              </div>
              <button onClick={handleAdd} className="addFriendButton">Add Friend</button>
            </div>
          ) : (
            hasSearched && <div className="noUserFound">No user found matching that username</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddUser;
