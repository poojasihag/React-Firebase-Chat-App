import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { toast } from "react-toastify";

const CACHE_KEY = "chattie_user_cache";

// Try to load cached user data for instant startup
const getCachedUser = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    // ignore parse errors
  }
  return null;
};

const cachedUser = getCachedUser();

export const useUserStore = create((set) => ({
  currentUser: cachedUser,
  isLoading: !cachedUser, // only show loading if no cache
  isFetching: false,

  fetchUserInfo: async (uid) => {
    if (!uid) {
      localStorage.removeItem(CACHE_KEY);
      return set({ currentUser: null, isLoading: false, isFetching: false });
    }

    // Deduplicate: If currentUser is already this user, do nothing
    const current = useUserStore.getState().currentUser;
    if (current && current.id === uid) {
      return set({ isLoading: false, isFetching: false });
    }

    // Deduplicate: If we are already fetching, don't run parallel fetches
    if (useUserStore.getState().isFetching) {
      return;
    }

    set({ isFetching: true, isLoading: true });

    // Try up to 4 times (with a delay) to get the document.
    // This resolves any race conditions during registration where the Auth user 
    // is created before the Firestore user document is written.
    let retries = 4;
    while (retries > 0) {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          localStorage.setItem(CACHE_KEY, JSON.stringify(userData));
          return set({ currentUser: userData, isLoading: false, isFetching: false });
        }
      } catch (error) {
        console.error(`fetchUserInfo attempt failed (${retries} retries left):`, error);
      }

      retries--;
      if (retries > 0) {
        // Wait 800ms before retrying
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    // If we reach here, we exhausted all retries and could not find the document
    console.error("User profile document not found in Firestore for uid:", uid);
    toast.error("User profile document not found. Please try logging in again.");
    localStorage.removeItem(CACHE_KEY);
    set({ currentUser: null, isLoading: false, isFetching: false });
  },
}));
