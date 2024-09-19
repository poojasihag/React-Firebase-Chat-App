import React from "react";
import "./detail.css";
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} />
        <h2>{user?.username}</h2>
        <p>vgfhfdgfjgfhyfhdfsjhfsjh</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & helps</span>
            <img src="./arrowUp.png" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://www.google.com/imgres?q=image%20to%20pdf&imgurl=https%3A%2F%2Fwww.ilovepdf.com%2Fimg%2Filovepdf%2Fsocial%2Fen-US%2Fimagepdf.png&imgrefurl=https%3A%2F%2Fwww.ilovepdf.com%2Fjpg_to_pdf&docid=ZFXNpLCzg1-bHM&tbnid=CC3mkMp08evUIM&vet=12ahUKEwiU3KSGp8qIAxXslFYBHf15FXMQM3oECHoQAA..i&w=1200&h=717&hcb=2&ved=2ahUKEwiU3KSGp8qIAxXslFYBHf15FXMQM3oECHoQAA" />
                <span>photo_2024_2.png</span>
              </div>
              <img src="./download.png" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://www.google.com/imgres?q=image%20to%20pdf&imgurl=https%3A%2F%2Fwww.ilovepdf.com%2Fimg%2Filovepdf%2Fsocial%2Fen-US%2Fimagepdf.png&imgrefurl=https%3A%2F%2Fwww.ilovepdf.com%2Fjpg_to_pdf&docid=ZFXNpLCzg1-bHM&tbnid=CC3mkMp08evUIM&vet=12ahUKEwiU3KSGp8qIAxXslFYBHf15FXMQM3oECHoQAA..i&w=1200&h=717&hcb=2&ved=2ahUKEwiU3KSGp8qIAxXslFYBHf15FXMQM3oECHoQAA" />
                <span>photo_2024_2.png</span>
              </div>
              <img src="./download.png" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://www.google.com/imgres?q=image%20to%20pdf&imgurl=https%3A%2F%2Fwww.ilovepdf.com%2Fimg%2Filovepdf%2Fsocial%2Fen-US%2Fimagepdf.png&imgrefurl=https%3A%2F%2Fwww.ilovepdf.com%2Fjpg_to_pdf&docid=ZFXNpLCzg1-bHM&tbnid=CC3mkMp08evUIM&vet=12ahUKEwiU3KSGp8qIAxXslFYBHf15FXMQM3oECHoQAA..i&w=1200&h=717&hcb=2&ved=2ahUKEwiU3KSGp8qIAxXslFYBHf15FXMQM3oECHoQAA" />
                <span>photo_2024_2.png</span>
              </div>
              <img src="./download.png" className="icon" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked"
            : isReceiverBlocked
            ? "User Blocked"
            : "Block User"}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
