import React, { useState, useEffect } from "react";
import { BsEmojiSmileFill, BsExclamationLg } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import Picker from "emoji-picker-react";
import "./chatinput.css";
import Dropzone from "react-dropzone";
import { AiOutlineUpload } from "react-icons/ai";
import axios from "axios";
import { BsFillMicFill } from "react-icons/bs";
import { AiTwotoneMinusSquare } from "react-icons/ai";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = "en-US";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);

  const handleListen = () => {
    if (isListening) {
      mic.start();
      mic.onend = () => {
        console.log("continue..");
        mic.start();
      };
    } else {
      mic.stop();
      mic.onend = () => {
        console.log("Stopped Mic on Click");
      };
    }
    mic.onstart = () => {
      console.log("Mics on");
    };

    mic.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      console.log(transcript);
      setNote(transcript);
      setMsg(transcript);
      mic.onerror = (event) => {
        console.log(event.error);
      };
    };
  };

  useEffect(() => {
    handleListen();
  }, [isListening]);

  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (event, emojiObject) => {
    let message = msg;
    message += emojiObject.emoji;
    setMsg(message);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
      setNote("");
    }
  };
  const host = "http://localhost:5000";
  const onDrop = (files) => {
    let formData = new FormData();
    const config = {
      header: { "content-type": "multipart/form-data" },
    };
    formData.append("file", files[0]);
    axios
      .post(`${host}/api/chat/uploadfiles`, formData, config)
      .then((response) => {
        if (response.data.success) {
          setMsg(response.data.url);
        }
      });
  };

  return (
    <div className="text_Input">
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <input
          type="text"
          placeholder="send a message..."
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <div className="chat_input_icons">
          {!isListening ? (
            <BsFillMicFill
              style={{ color: "#62c28b" }}
              size="15"
              onClick={() => setIsListening(true)}
            />
          ) : (
            <AiTwotoneMinusSquare
              style={{ color: "red" }}
              size="15"
              onClick={() => setIsListening(false)}
            />
          )}

          <BsExclamationLg size="15" style={{ color: "#62c28b" }} />
          <Dropzone onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <AiOutlineUpload
                    type="upload"
                    size="20"
                    style={{ color: "#62c28b" }}
                  />
                </div>
              </section>
            )}
          </Dropzone>

          <button type="submit">
            <IoMdSend />
          </button>
        </div>
      </form>
    </div>
  );
}
