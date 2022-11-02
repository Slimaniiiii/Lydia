import React, { useState } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = "en-US";

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState(null);

  const handleListen = (setMsg) => {
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
  return {
    handleListen,
  };
};

export default SpeechToText;
