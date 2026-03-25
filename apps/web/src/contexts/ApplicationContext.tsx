import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

export interface ApplicationDispatchContextValue {
  setSelectedMatchId: React.Dispatch<React.SetStateAction<string>>;
}

export type ApplicationContextValue = {
  selectedMatchId: string;
};

const ApplicationContext = createContext<ApplicationContextValue | null>(null);
const ApplicationDispatchContext =
  createContext<ApplicationDispatchContextValue | null>(null);

export function ApplicationProvider({ children }: PropsWithChildren) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");

  return (
    <ApplicationContext.Provider
      value={{
        selectedMatchId,
      }}
    >
      <ApplicationDispatchContext.Provider
        value={{
          setSelectedMatchId,
        }}
      >
        {children}
      </ApplicationDispatchContext.Provider>
    </ApplicationContext.Provider>
  );
}

export function useApplicationContext() {
  const context = useContext(ApplicationContext);

  if (context === null) {
    throw new Error(
      "useApplicationContext must be used within ApplicationProvider",
    );
  }

  return context;
}

export function useApplicationDispatchContext() {
  const context = useContext(ApplicationDispatchContext);

  if (context === null) {
    throw new Error(
      "useApplicationDispatchContext must be used within ApplicationProvider",
    );
  }

  return context;
}
