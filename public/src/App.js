import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SetAvatar from "./components/SetAvatar";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./app.css";
import { ThemeContext, localStorageTheme } from "./contexts/ThemeContext";
export default function App() {
  const [theme, setTheme] = useState("");

  useEffect(() => {
    const fetchuserTheme = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      console.log("datathepme", data.theme);
      setTheme(theme === "" && data.theme);
    };
    fetchuserTheme();
  }, []);
  console.log(theme);
  return (
    <ThemeContext.Provider value={{ theme, setTheme, localStorageTheme }}>
      <div className="App" id={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/setAvatar" element={<SetAvatar />} />
            <Route path="/" element={<Chat />} />
            <Route path="/chat/:room_id/:room_name" element={<Chat />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeContext.Provider>
  );
}
