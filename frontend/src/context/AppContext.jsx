import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import io from "socket.io-client";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });

  // ✨ The socket instance is now created using useMemo to prevent re-creation on every render
  const socket = useMemo(() => {
    if (!user?.token) return null; // Don't connect if there is no token

    return io("http://localhost:5000", {
      // ✨ Send token for authentication
      auth: {
        token: user.token,
      },
      "force new connection": true,
      reconnectionAttempts: "Infinity",
      timeout: 10000,
      transports: ["websocket"],
    });
  }, [user?.token]);

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

  // ✨ Handle socket event listeners
  useEffect(() => {
    if (!socket) return; // Do nothing if socket is not initialized

    const handleUpdateRoomState = (data) => setRoomState(data);
    const handleNotification = (data) => toast.info(data.message);
    const handleError = (data) => toast.error(data.message);
    const handleConnectError = (err) =>
      toast.error(`Connection failed: ${err.message}`);

    socket.on("connect_error", handleConnectError);
    socket.on("updateRoomState", handleUpdateRoomState);
    socket.on("notification", handleNotification);
    socket.on("error", handleError);

    // Cleanup on component unmount
    return () => {
      socket.off("connect_error", handleConnectError);
      socket.off("updateRoomState", handleUpdateRoomState);
      socket.off("notification", handleNotification);
      socket.off("error", handleError);
    };
  }, [socket]);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setRoomState(null); // Clear room state on logout
    if (socket) socket.disconnect();
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = { socket, roomState, theme, toggleTheme, user, login, logout };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
