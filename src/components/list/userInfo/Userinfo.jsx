import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import "./userInfo.css";
import { IoIosLogOut } from "react-icons/io";
import { auth } from "../../../lib/firebase";
import React from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";

const Userinfo = () => {
  const { currentUser } = useUserStore();
  const { resetChat } = useChatStore();

  const handleLogout = () => {
    resetChat(); // Clear persisted chat state
    auth.signOut();
  };

  return (
    <div className="userInfo">
      <div className="user">
        <PhotoProvider>
          <PhotoView src={currentUser.avatar || "./avatar.png"}>
            <img src={currentUser.avatar || "./avatar.png"} />
          </PhotoView>
        </PhotoProvider>
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        {
          <IoIosLogOut
            className="w-6 h-6 "
            onClick={handleLogout}
          ></IoIosLogOut>
        }

        <img src="./edit.png" />
      </div>
    </div>
  );
};

export default Userinfo;
