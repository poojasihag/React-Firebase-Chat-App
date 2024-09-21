import { useUserStore } from "../../../lib/userStore";
import "./userInfo.css";
import { IoIosLogOut } from "react-icons/io";
import { auth } from "../../../lib/firebase";
import React from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";

const Userinfo = () => {
  const { currentUser } = useUserStore();

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
            onClick={() => auth.signOut()}
          ></IoIosLogOut>
        }

        <img src="./edit.png" />
      </div>
    </div>
  );
};

export default Userinfo;
