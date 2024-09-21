import React, { useEffect } from "react";
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { LoaderProvider } from "./lib/LoaderProvider";

const App = () => {
  
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  useEffect(() => {    
    const unSub = onAuthStateChanged(auth, (user) => {

      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

 

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <LoaderProvider>
    <div className="rapper">
      {currentUser ? (
        <>
          <div className="hidden lg:block">
            <List />
          </div>
          <div className="block lg:hidden">{!chatId && <List />}</div>

          {chatId && <Chat />}
          {/* {chatId && <Detail />} */}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
    </LoaderProvider>
  );
};

export default App;
