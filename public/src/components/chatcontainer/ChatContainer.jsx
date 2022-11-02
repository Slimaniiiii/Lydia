import React, { useState, useEffect, useRef } from "react";
import ChatInput from "../chatinput/ChatInput";
import Logout from "../Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../../utils/APIRoutes";
import "./chatcontainer.css";
import moment from "moment";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import UserModalPopup from "../usermodal/UserModalPopup";
import "../usermodal/userModalPopup.css";
import { Tooltip, Dropdown, Menu, Space, Modal } from "antd";
import "antd/dist/antd.css";
import { AiFillDelete, AiFillPushpin } from "react-icons/ai";
import { FiPhoneCall } from "react-icons/fi";
import { TbPinned } from "react-icons/tb";
import Peer from "simple-peer";
import VideoCallModal from "../videocall/VideoCallModal";


export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [pins, setPins] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [droppableID, setDroppableID] = useState(null);
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isOpenVideoModal, setIsOpenVideoModal] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();


  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.current.on("callUser", (data) => {
      console.log("callUser", data);
      setReceivingCall(true);
      setIsOpenVideoModal(true);
      setCallerSignal(data.signal);
    });
  }, []);
  const callUser = async (id) => {
    const dataa = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.current.emit("callUser", {
        userToCall: currentChat._id,
        signal: data,
        from: dataa._id,
        name: dataa.username,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.current.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {  
    setCallAccepted(true);    
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.current.emit("answerCall", {
        signal: data,
        to: currentChat._id,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    console.log("callerSignal", callerSignal);

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };
  
  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  const disableMicrophone = () => {
    const audio = myVideo.current.srcObject;
    console.log("audio", audio);
    audio.enabled = false;
  };

  const disableVideo = () => {
    const video = myVideo.current.srcObject.getVideoTracks()[0];
    video.enabled = false;
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      socket.current.emit("join", {
        name: data.username,
        room_id: currentChat._id,
        user_id: data._id,
      });
    };
    fetchData();
  }, [currentChat._id, socket]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      const response = await axios.post(recieveMessageRoute, {
        from: data._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    };
    fetchData();
  }, [currentChat]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      const response = await axios.post(
        `http://localhost:5000/api/pins/getpins/`,
        {
          from: data._id,
          to: currentChat._id,
        }
      );
      setPins(response.data);
    };
    fetchData();
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleAddPin = async (time, mesg, mesgid) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    await axios.post(`http://localhost:5000/api/pins/addpin/`, {
      from: data._id,
      to: currentChat._id,
      content: mesg,
      time: time,
      fromId: mesgid,
    });
    const response = await axios.post(
      `http://localhost:5000/api/pins/getpins/`,
      {
        from: data._id,
        to: currentChat._id,
      }
    );
    setPins(response.data);
  };

  const handleDeleteMessage = async (id) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    await axios.delete(
      `http://localhost:5000/api/messages/deleteMessage/${id}`
    );
    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    });
    setMessages(response.data);
  };

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    const msgs = [...messages];
    if (msg.substring(0, 7) === "uploads") {
      socket.current.emit("send-msg", {
        to: currentChat._id,
        from: data._id,
        msg: msg,
      });
      await axios.post(sendMessageRoute, {
        from: data._id,
        to: currentChat._id,
        message: msg,
        time: new Date(),
      });
      msgs.push({ fromSelf: true, message: msg, type: "file" });
    } else {
      socket.current.emit("send-msg", {
        to: currentChat._id,
        from: data._id,
        msg,
      });
      await axios.post(sendMessageRoute, {
        from: data._id,
        to: currentChat._id,
        message: msg,
        time: new Date(),
      });
      msgs.push({ fromSelf: true, message: msg, type: "text" });
    }

    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    });
    setMessages(response.data);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, [socket]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const menu = (
    <Menu theme="dark">
      {pins.length > 0 ? (
        <>
          {" "}
          {pins.map((pin) => (
            <Menu.Item
              key={pin._id}
              draggable="true"
              onDragStart={(e) => onDragStart(e, pin._id)}
              onClick={() => jumpToPinnedMessage(pin.fromId._id)}
            >
              <img
                src={`data:image/svg+xml;base64,${pin.sender.avatarImage}`}
                alt=""
                style={{ maxWidth: "40px" }}
              />{" "}
              {pin.sender.username}:{" "}
              <span style={{ color: "#34eb8c" }}>
                {pin.content.substring(0, 7) === "uploads" ? (
                  <img
                    // className="isImageMovable"
                    style={{ maxWidth: "50px" }}
                    src={`http://localhost:5000/${pin.content}`}
                    alt="c"
                  />
                ) : (
                  pin.content
                )}{" "}
              </span>
              at{" "}
              <span style={{ color: "#858483" }}>
                {moment(pin.time).format("YYYY-MM-DD HH:mm")}
              </span>
            </Menu.Item>
          ))}
        </>
      ) : (
        <Menu.Item key="0">No pinned messages in this chatroom!</Menu.Item>
      )}
    </Menu>
  );
  const onDragOver = (ev) => {
    ev.preventDefault();
  };

  const onDragStart = (ev, id) => {
    setDroppableID(id);
  };
  const onDrop = async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    await axios.delete(
      `http://localhost:5000/api/pins/deletePin/${droppableID}`
    );
    const response = await axios.post(
      `http://localhost:5000/api/pins/getpins/`,
      {
        from: data._id,
        to: currentChat._id,
      }
    );
    setPins(response.data);
  };

  const jumpToPinnedMessage = async (id) => {
    const element = document.getElementById(id);
    element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="containerr">
      <div className="chat-header">
        <div onClick={() => setIsOpen(true)}>
          <div className="user-details">
            <div className="avatarTop">
              <img
                src={`http://localhost:5000/${currentChat.avatarImage}`}
                alt=""
              />
            </div>
            <div className="username">
              <h3>{currentChat.username}</h3>
            </div>
          </div>
        </div>
        <UserModalPopup
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          name={currentChat.username}
          avatar={currentChat.avatarImage}
        />
        <VideoCallModal
          isOpenVideoModal={isOpenVideoModal}
          setIsOpenVideoModal={setIsOpenVideoModal}
          name={currentChat.username}
          avatar={currentChat.avatarImage}
          stream={stream}
          myVideo={myVideo}
          callAccepted={callAccepted}
          callEnded={callEnded}
          userVideo={userVideo}
          receivingCall={receivingCall}
          answerCall={answerCall}
          leaveCall={leaveCall}
          disableMicrophone={disableMicrophone}
          disableVideo={disableVideo}
        />
        <div className="icon-details">
          <FiPhoneCall
            color="white"
            size="20"
            onClick={() => {
              setIsOpenVideoModal(true);
              !callAccepted && callUser();
            }}
          />
          <Space direction="vertical">
            <Space wrap>
              <Dropdown arrow={true} overlay={menu} placement="bottom">
                <TbPinned size="20" color="white" />
              </Dropdown>
            </Space>
          </Space>
          <Logout />
        </div>
      </div>
      <div
        className="chat-messages"
        onDragOver={(e) => onDragOver(e)}
        onDrop={(e) => {
          onDrop(e, "wip");
        }}
      >
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <span className="time_color">
                    {moment(message.time).format("LT")}
                  </span>
                  <Tooltip
                    title={
                      <>
                        <AiFillPushpin
                          size="20"
                          style={{ marginRight: "10px" }}
                          onClick={() => {
                            handleAddPin(
                              message.time,
                              message.message,
                              message.id
                            );
                          }}
                        />
                        <AiFillDelete
                          color="red"
                          size="20"
                          onClick={() => handleDeleteMessage(message.id)}
                        />{" "}
                      </>
                    }
                    placement={message.fromSelf ? "left" : "right"}
                  >
                    <p className="content_message" id={message.id}>
                      {message.message.substring(0, 7) === "uploads" ? (
                        <>
                          {/* <video  style={{ maxWidth: "200px" }} src={message.message.substring(message.message.length - 3,message.message.length === "mp4") && `http://localhost:5000/${message.message}`} /> */}

                          <PhotoProvider>
                            <PhotoView
                              src={`http://localhost:5000/${message.message}`}
                            >
                              <img
                                // className="isImageMovable"
                                style={{ maxWidth: "200px" }}
                                src={`http://localhost:5000/${message.message}`}
                                alt="c"
                              />
                            </PhotoView>
                          </PhotoProvider>
                        </>
                      ) : (
                        <>{message.message}</>
                      )}
                    </p>
                  </Tooltip>
                </div>
                {/* <div className="arrow"> </div> */}
                {/* <div className="popup-image">
                <span onClick={closeImage}>&times;</span>
                <img
                  id="myimage"
                  src="http://localhost:5000/uploads/1656346941607_a4321ca2e5695557ff791685f3df1d1f.jpg"
                  alt="test"
                />
                <button type="button" color="red" onClick={() => zoomin()}>
                  +
                </button>
                <button type="button" color="red" onClick={() => zoomout()}>
                  -
                </button>
              </div> */}
              </div>
            </div>
          );
        })}
      </div>

      <ChatInput handleSendMsg={handleSendMsg} />
    </div>
  );
}
