import { useUserStore } from "../../../lib/userStore";
import "./userInfo.css";
import { IoIosLogOut } from "react-icons/io";
import { auth } from "../../../lib/firebase";
import React from "react";

const Userinfo = () => {
  const { currentUser } = useUserStore();

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} />
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
