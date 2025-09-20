import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import io from "socket.io-client";

const server = "http://localhost:5000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io(server, connectionOptions);

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // ✨ MAJOR CHANGE: We now store the entire room object from the backend.
  const [roomState, setRoomState] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ✨ MAJOR CHANGE: Replaced all old listeners with new, simpler ones.
  useEffect(() => {
    // This is the primary listener. It updates the entire UI with the latest state.
    const handleUpdateRoomState = (data) => {
      setRoomState(data);
    };

    // Listener for general notifications (join, leave, etc.)
    const handleNotification = (data) => {
      toast.info(data.message);
    };

    // Listener for errors sent from the backend
    const handleError = (data) => {
      toast.error(data.message);
    };

    socket.on("updateRoomState", handleUpdateRoomState);
    socket.on("notification", handleNotification);
    socket.on("error", handleError);

    return () => {
      socket.off("updateRoomState", handleUpdateRoomState);
      socket.off("notification", handleNotification);
      socket.off("error", handleError);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Expose the new roomState to the rest of the app.
  const value = { socket, roomState, theme, toggleTheme };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
