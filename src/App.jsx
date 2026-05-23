import React, { useEffect, useState } from "react";
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { LoaderProvider } from "./lib/LoaderProvider";

const App = () => {
  
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, resetChat } = useChatStore();

  useEffect(() => {   
    const unSub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User logged out — clear everything
        resetChat();
      }
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo, resetChat]);

  const [showDetail, setShowDetail] = useState(false);

  return (
    <LoaderProvider>
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="rapper">
          {currentUser ? (
            <>
              {/* Desktop Sidebar: permanent flex item with fixed/min width */}
              <div className="hidden lg:flex w-[350px] min-w-[320px] h-full flex-shrink-0">
                <List />
              </div>

              {/* Mobile Sidebar: full width, only visible when no chat is selected */}
              {!chatId && (
                <div className="flex lg:hidden w-full h-full">
                  <List />
                </div>
              )}

              {/* Chat View Area: stretches to occupy all remaining space */}
              {chatId ? (
                <Chat 
                  toggleDetail={() => setShowDetail((prev) => !prev)} 
                  showDetail={showDetail} 
                />
              ) : (
                /* Desktop Empty State: shown when no chat is selected */
                <div className="hidden lg:flex flex-col flex-1 justify-center items-center text-center p-8 bg-[#8e82b205] text-white">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl animate-bounce">
                      💬
                    </div>
                    <h2 className="text-2xl font-bold tracking-wide font-display">Chattie</h2>
                    <p className="text-sm text-purple-200/70 max-w-xs">
                      Select a friend from the list or add a new friend to start sending messages instantly!
                    </p>
                  </div>
                </div>
              )}

              {chatId && showDetail && (
                <Detail onClose={() => setShowDetail(false)} />
              )}
            </>
          ) : (
            <Login />
          )}
        </div>
      )}
      <Notification />
    </LoaderProvider>
  );
};

export default App;
