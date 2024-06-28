import React, { FunctionComponent, useContext, useState } from "react";
import { LoadingScreenModal } from "./modal";

export interface LoadingScreen {
  isLoading: boolean;
  setIsLoading(value: boolean): void;
  // Wait until the modal is opened on the UI thread actually.
  openAsync(): Promise<void>;
}

export const LoadingScreenContext = React.createContext<LoadingScreen | null>(
  null
);

export const LoadingScreenProvider: FunctionComponent = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const openAsync = (): Promise<void> => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      if (isLoading) {
        resolve();
      }
    });
  };

  return (
    <LoadingScreenContext.Provider
      value={{ isLoading, setIsLoading, openAsync }}
    >
      {children}
      <LoadingScreenModal isOpen={isLoading} />
    </LoadingScreenContext.Provider>
  );
};

export const useLoadingScreen = () => {
  const context = useContext(LoadingScreenContext);
  if (!context) {
    throw new Error("You forgot to use LoadingScreenContext");
  }
  return context;
};
