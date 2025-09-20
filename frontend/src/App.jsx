import { ToastContainer } from "react-toastify";
import { Route, Routes } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import Home from "./Pages/Home/Home.jsx";
import Room from "./Pages/Room/Room.jsx";
import ThemeToggle from "./Components/ThemeToggle/ThemeToggle.jsx";
import WordLists from "./Pages/WordLists/WordLists.jsx"; // ✨ Import the new page

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
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        {/* ✨ NEW ROUTE for managing word lists */}
        <Route path="/word-lists" element={<WordLists />} />
      </Routes>
    </AppContextProvider>
  );
}

export default App;
