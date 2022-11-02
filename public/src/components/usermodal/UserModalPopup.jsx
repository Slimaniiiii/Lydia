import React, { useRef, useEffect } from "react";
import "./userModalPopup.css";


const UserModalPopup = ({ isOpen, setIsOpen, avatar, name }) => {
  const wrapperRef = useRef();

  if (isOpen) {
    //getElement by Id and set display to block

  }

  useEffect(() => {
    if (isOpen) {
      document.getElementById("modal").style.display = "block";
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen]);

  return (
    <div>
      {isOpen && (
        <aside id="modal" className="modal">
          <div className="wrap" ref={wrapperRef}>
            <img
              src={`http://localhost:5000/${avatar}`}
              alt="userPic"
              style={{ maxWidth: "240px", borderRadius:"10px" }}
            />
            <h1>{name}</h1>
            <span onClick={() => setIsOpen(false)} className="close">
              +
            </span>
          </div>
        </aside>
      )}
    </div>
  );
};

export default UserModalPopup;
