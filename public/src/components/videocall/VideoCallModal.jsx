import React, { useRef, useEffect } from "react";
import "./videoCallModal.css";
import { BiMicrophoneOff, BiMicrophone } from "react-icons/bi";
import { FaVideoSlash, FaVideo } from "react-icons/fa";
import { ImPhoneHangUp } from "react-icons/im";
const VideoCallModal = ({
  isOpenVideoModal,
  setIsOpenVideoModal,
  avatar,
  name,
  stream,
  myVideo,
  callAccepted,
  callEnded,
  userVideo,
  receivingCall,
  answerCall,
  leaveCall,
  disableMicrophone,
  disableVideo,
}) => {
  const VideowrapperRef = useRef();

  useEffect(() => {
    if (isOpenVideoModal) {
      document.getElementById("modal").style.display = "block";
    }
  }, [isOpenVideoModal]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        VideowrapperRef.current &&
        !VideowrapperRef.current.contains(event.target)
      ) {
        setIsOpenVideoModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpenVideoModal]);

  return (
    <div>
      {isOpenVideoModal && (
        <aside id="modal" className="modal">
          <div className="wrap" ref={VideowrapperRef}>
            <h1>Video Call...</h1>
            {/* <img
                src={`data:image/svg+xml;base64, ${avatar}`}
                alt=""
                style={{ maxWidth: "70px" }}
                /> */}
            <h1>{name}</h1>
            <div>
              {stream && (
                <video
                  className="video"
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  style={{ width: "150px" }}
                />
              )}
            </div>
            <div>
              {callAccepted && !callEnded ? (
                <video
                  className="video"
                  playsInline
                  ref={userVideo}
                  autoPlay
                  style={{ width: "150px" }}
                />
              ) : null}
            </div>
            <div>
              {receivingCall && !callAccepted ? (
                <div className="caller">
                  <h1>{name} is calling...</h1>
                  <button color="primary" onClick={() => answerCall()}>
                    Answer
                  </button>
                </div>
              ) : null}
            </div>
            {callAccepted && !callEnded && (
              <div className="call_actions">
                {" "}
                <ImPhoneHangUp className="hang_up_icon" onClick={() => leaveCall()} />
                <BiMicrophoneOff className="mute_mic" onClick={() => disableMicrophone()} />
                <FaVideoSlash className="mute_video" onClick={() => disableVideo()} />
              </div>
            )}

            <span onClick={() => setIsOpenVideoModal(false)} className="close">
              +
            </span>
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoCallModal;
