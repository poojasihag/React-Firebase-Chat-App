import React, { createContext, useState, useContext } from "react";

// Create the context
const LoaderContext = createContext();

// Create a provider component
export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Functions to show and hide the loader
  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
      {isLoading && <Loader />}
    </LoaderContext.Provider>
  );
};

// Custom hook to use the Loader context
export const useLoader = () => useContext(LoaderContext);

// Loader component with UI from Uiverse
const Loader = () => (
  <div className="w-full gap-x-2 flex justify-center items-center fixed inset-0 bg-[#9f9f9fa3] z-50">
    <div
      className="w-5 bg-[#d991c2] animate-pulse h-5 rounded-full animate-bounce"
    ></div>
    <div
      className="w-5 animate-pulse h-5 bg-[#9869b8] rounded-full animate-bounce"
    ></div>
    <div
      className="w-5 h-5 animate-pulse bg-[#6756cc] rounded-full animate-bounce"
    ></div>
  </div>
);
