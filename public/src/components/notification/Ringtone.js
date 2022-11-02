import { Howl } from "howler";

export const playAudio = (audioName) => {
  console.log("audioName", audioName);
  if (audioName === "stop") return;
  const audio = new Howl({
    src: [require(`../../ringtones/${audioName}.mp3`)],
    volume: 0.5,
    loop: false,
  });
  audio.play();
};

// export const stopAudio = (audioName) => {
//   const audio = new Howl({
//     src: [require(`../../ringtones/${audioName}.mp3`)],
//     volume: 0.5,
//     loop: false,
//   });
//   audio.stop();
// };
