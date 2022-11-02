import React, { useState, useRef, useEffect, useContext } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import { Col, Row } from "antd";
import { Radio, Space, Tabs } from "antd";
import { canvasPreview } from "../imageCrop/canvasPreview";
import { useDebounceEffect } from "../imageCrop/useDebounceEffect";
import axios from "axios";
import { setAvatarRoute } from "../../utils/APIRoutes";
import { Switch } from "antd";
import { Avatar, Card } from "antd";

import "react-image-crop/dist/ReactCrop.css";
import "./profileModal.css";
import { BsSave } from "react-icons/bs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Upload } from "antd";
import { ToastContainer, toast } from "react-toastify";
import { ThemeContext } from "../../contexts/ThemeContext";
import crimsonTheme from "../../themePictures/crimsonTheme.png";
import darkTheme from "../../themePictures/darkTheme.png";
import defaultTheme from "../../themePictures/defaultTheme.png";
const { TabPane } = Tabs;

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}
const { Meta } = Card;

const ProfileModal = ({ openProfileModal, setOpenProfileModal }) => {
  const { setTheme, localStorageTheme } = useContext(ThemeContext);

  const [tabPosition, setTabPosition] = useState("top");
  const changeTabPosition = (e) => {
    setTabPosition(e.target.value);
  };
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
  const profileref = useRef();
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const [crop, setCrop] = useState(Crop);
  const [completedCrop, setCompletedCrop] = useState(PixelCrop);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  console.log(previewCanvasRef);

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined);
    } else if (imgRef.current) {
      const { width, height } = imgRef.current;
      setAspect(16 / 9);
      setCrop(centerAspectCrop(width, height, 16 / 9));
    }
  }

  useEffect(() => {
    if (openProfileModal) {
      document.getElementById("profileModal").style.display = "block";
    }
  }, [openProfileModal]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileref.current && !profileref.current.contains(event.target)) {
        setOpenProfileModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpenProfileModal]);

  // const host = "http://localhost:5000";
  // const onDrop = (files) => {
  //   console.log("files", files)
  //   let formData = new FormData();
  //   const config = {
  //     header: { "content-type": "multipart/form-data" },
  //   };
  //   formData.append("file", files[0]);
  //   axios
  //     .post(`${host}/api/chat/uploadfiles`, formData, config)
  //     .then((response) => {
  //       if (response.data.success) {
  //         setMsg(response.data.url);
  //       }
  //     });
  // };
  const host = "http://localhost:5000";
  const saveProfilePic = async () => {
    const canvas = previewCanvasRef.current;
    const user = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    console.log(canvas);
    canvas.toBlob(
      function (blob) {
        //add file property to blob
        blob.name = "image.png";
        //create a new file
        const file = new File([blob], "image.png", { type: "image/png" });
        //create a new formdata
        const formData = new FormData();
        //add the file to formdata
        formData.append("file", file);
        //post the formdata
        axios
          .post(`${host}/api/chat/uploadfiles`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            if (response.data.success) {
              axios.post(`${setAvatarRoute}/${user._id}`, {
                image: response.data.url,
              });
              user.avatarImage = response.data.url;
              localStorage.setItem(
                process.env.REACT_APP_LOCALHOST_KEY,
                JSON.stringify(user)
              );
              setOpenProfileModal(false);
              //success toast
              toast.success("Avatar updated successfully", toastOptions);
            }
          })
          .catch((error) => {
            toast.error("Failed to update avatar", toastOptions);
            console.log(error);
          });
      },
      "image/png",
      1
    );
  };
  const [mode, setMode] = useState("top");

  const handleModeChange = (e) => {
    setMode(e.target.value);
  };
  return (
    <>
      {openProfileModal && (
        <div id="profileModal" className="profileModal">
          <div className="wrap" ref={profileref}>
            <Tabs
              tabPosition={tabPosition}
              centered
              size="large"
              tabBarStyle={{ color: "white", borderBottomColor: "green" }}
            >
              <TabPane tab="Profile" key="1">
                <Row>
                  <Col span={8}>
                    <div className="Crop-Controls">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                      />
                      <div>
                        <label htmlFor="scale-input">Scale: </label>
                        <Input
                          style={{ width: "30%" }}
                          id="scale-input"
                          type="number"
                          step="0.1"
                          value={scale}
                          disabled={!imgSrc}
                          onChange={(e) => setScale(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label htmlFor="rotate-input">Rotate: </label>
                        <Input
                          style={{ width: "30%" }}
                          id="rotate-input"
                          type="number"
                          value={rotate}
                          disabled={!imgSrc}
                          onChange={(e) =>
                            setRotate(
                              Math.min(
                                180,
                                Math.max(-180, Number(e.target.value))
                              )
                            )
                          }
                        />
                      </div>
                      <div>
                        <label htmlFor="rotate-input">Toggle aspect </label>
                        <Switch
                          onClick={handleToggleAspectClick}
                          checkedChildren="On"
                          unCheckedChildren="Off"
                          defaultChecked
                        />
                        {/* <button onClick={handleToggleAspectClick}>
                  Toggle aspect {aspect ? "off" : "on"}
                </button> */}
                      </div>
                    </div>
                  </Col>
                  <Col span={14}>
                    {Boolean(imgSrc) ? (
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                      >
                        <img
                          ref={imgRef}
                          alt="Crop me"
                          src={imgSrc}
                          height="252px"
                          // width="100px"
                          style={{
                            transform: `scale(${scale}) rotate(${rotate}deg)`,
                          }}
                          onLoad={onImageLoad}
                        />
                      </ReactCrop>
                    ) : (
                      <h2 style={{ color: "white" }}>Select an image!</h2>
                    )}
                    {/* set invisible*/}
                    <div style={{ display: "none" }}>
                      {Boolean(completedCrop) && (
                        <canvas
                          ref={previewCanvasRef}
                          style={{
                            border: "1px solid black",
                            objectFit: "contain",
                            width: completedCrop.width,
                            height: completedCrop.height,
                          }}
                        />
                      )}
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="Theme" key="2">
                <div className="theme_cards">
                  <Card
                    onClick={() => {
                      setTheme("");
                      localStorageTheme("");
                    }}
                    className="card_set_Theme"
                    size="small"
                    style={{ width: 180 }}
                    cover={<img alt="example" src={defaultTheme} />}
                  >
                    <Meta
                      title="Default"
                      description="Default theme for Lydia"
                    />
                  </Card>
                  <Card
                    onClick={() => {
                      setTheme("crimson");
                      localStorageTheme("crimson");
                    }}
                    className="card_set_Theme"
                    size="small"
                    style={{ width: 180 }}
                    cover={<img alt="example" src={crimsonTheme} />}
                  >
                    <Meta
                      title="Crimson"
                      description="Crimson theme for Lydia"
                    />
                  </Card>

                  <Card
                    onClick={() => {
                      setTheme("dark");
                      localStorageTheme("dark");
                    }}
                    className="card_set_Theme"
                    size="small"
                    style={{ width: 180 }}
                    cover={<img alt="example" src={darkTheme} />}
                  >
                    <Meta title="Dark" description="Dark theme for Lydia" />
                  </Card>
                </div>
              </TabPane>
              <TabPane tab="Configuration" key="3">
                Content of Tab 3
              </TabPane>
              <TabPane tab="Ringtone" key="4">
                Content of Tab 4
              </TabPane>
            </Tabs>
            <div className="footer_actions">
              <Button onClick={() => saveProfilePic()}>Save</Button>
              <Button onClick={() => setOpenProfileModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default ProfileModal;
