import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { allUsersRoute, host, getAllRooms } from "../utils/APIRoutes";
import ChatContainer from "../components/chatcontainer/ChatContainer";
import Contacts from "../components/contact/Contacts";
import Welcome from "../components/welcome/Welcome";
import "./chat.css";
export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
        navigate("/login");
      } else {
        setCurrentUser(
          await JSON.parse(
            localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
          )
        );
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(data.data);
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchData();
  }, [currentUser, navigate]);

  //fetch rooms
  useEffect(() => {
    const fetchData = async () => {
      const r = await axios.get(`${getAllRooms}`);
      setRooms(r.data);
    };
    fetchData();
  }, []);

  const handleChatChange = (chat) => {
    console.log("chat", chat)
    setCurrentChat(chat);
  };
  return (
    <div className="chat_container">
      <div className="container">
        <Contacts contacts={contacts} changeChat={handleChatChange} rooms={rooms} />
        {currentChat === undefined ? (
          <Welcome />
        ) : (
          <ChatContainer currentChat={currentChat} socket={socket} />
        )}
      </div>
    </div>
  );
}
