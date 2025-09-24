import { ToastContainer } from "react-toastify";
import { Route, Routes } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";

// Import components and pages
import Home from "./Pages/Home/Home.jsx";
import Room from "./Pages/Room/Room.jsx";
import Login from "./Pages/Login/Login.jsx";
import Signup from "./Pages/Signup/Signup.jsx";
import WordLists from "./Pages/WordLists/WordLists.jsx";
// ✨ ThemeToggle is no longer imported here
import ProtectedRoute from "./Components/ProtectedRoute.jsx";

function App() {
  return (
    <AppContextProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* ✨ ThemeToggle has been removed from here */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />

        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          }
        />
        <Route
          path="/word-lists"
          element={
            <ProtectedRoute>
              <WordLists />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppContextProvider>
  );
}

export default App;
