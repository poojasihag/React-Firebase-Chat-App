import { create } from "zustand";
import { useUserStore } from "./userStore";

const CHAT_CACHE_KEY = "chattie_active_chat";

// Restore chat state from sessionStorage on reload
const getCachedChat = () => {
  try {
    const cached = sessionStorage.getItem(CHAT_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    // ignore
  }
  return { chatId: null, user: null };
};

const cachedChat = getCachedChat();

export const useChatStore = create((set) => ({
  chatId: cachedChat.chatId,
  user: cachedChat.user,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    if (chatId === null) {
      sessionStorage.removeItem(CHAT_CACHE_KEY);
      return set({
        chatId: null,
        user: null,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }

    let isCurrentUserBlocked = false;
    let isReceiverBlocked = false;

    // Check if current user is blocked
    if (user.blocked?.includes(currentUser?.id)) {
      isCurrentUserBlocked = true;
    }
    // Check if receiver user is blocked
    else if (currentUser?.blocked?.includes(user.id)) {
      isReceiverBlocked = true;
    }

    // Persist to sessionStorage so it survives reloads
    sessionStorage.setItem(CHAT_CACHE_KEY, JSON.stringify({ chatId, user }));

    return set({
      chatId,
      user: isCurrentUserBlocked ? null : user,
      isCurrentUserBlocked,
      isReceiverBlocked,
    });
  },

  changeBlocked: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },

  resetChat: () => {
    sessionStorage.removeItem(CHAT_CACHE_KEY);
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
}));
