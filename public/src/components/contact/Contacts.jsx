import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../../assets/logo.svg";
import "./contact.css";
import { AiFillGithub } from "react-icons/ai";
import { FcDataConfiguration } from "react-icons/fc";
import { CgProfile } from "react-icons/cg";
import ProfileModal from "../profile/ProfileModal";

export default function Contacts({ contacts, changeChat, rooms }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      setCurrentUserName(data.username);
      setCurrentUserImage(data.avatarImage);
    };
    fetchData();
  }, []);

  const changeCurrentChat = (index, contact) => {
    console.log("contact", contact);
    setCurrentSelected(index);
    changeChat(contact);
  };
  return (
    <>
      {currentUserImage && currentUserImage && (
        <div className="contact_container">
          <div className="brand">
            {/* <img src={Logo} alt="logo" /> */}
            <h3>Lydia</h3>
          </div>
          <div className="cc">
            <div className="contacts">
              {rooms.map((room, index) => {
                return (
                  <div
                    key={room._id}
                    className={`contact ${
                      index === currentSelected ? "selected" : ""
                    }`}
                    onClick={() => changeCurrentChat(index, room)}
                  >
                    <div className="avatarLeft">
                      <img
                        // src={`http://localhost:5000/${contact.avatarImage}`}
                        alt=""
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="contacts">
              {contacts.map((contact, index) => {
                return (
                  <div
                    key={contact._id}
                    className={`contact ${
                      index === currentSelected ? "selected" : ""
                    }`}
                    onClick={() => changeCurrentChat(index, contact)}
                  >
                    <div className="avatar">
                      <img
                        src={`http://localhost:5000/${contact.avatarImage}`}
                        alt=""
                      />
                    </div>
                    <div className="username">
                      <h3>{contact.username}</h3>
                      <small className="last_message_sent">
                        sqdqsdqsdsqdsqdsqdsd
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="contact_icons">
            <CgProfile
              size="20"
              color="white"
              onClick={() => setOpenProfileModal(true)}
            />
            <AiFillGithub size="20" color="white" />
          </div>
          <ProfileModal
            openProfileModal={openProfileModal}
            setOpenProfileModal={setOpenProfileModal}
          />

          {/* <div className="current-user">  
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div> */}
        </div>
      )}
    </>
  );
}
