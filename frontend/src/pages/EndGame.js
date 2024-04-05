import Result from "../components/Game/GameResult.js";
import EndBtn from "../components/Game/EndBtn.js";
import EndConfetti from "../components/Game/EndConfetti.js";

export default function EndGame(data) {
  console.log("END GAME: ", data);
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const hasWon = data.leftScore < data.rightScore ? true : false;
  const hasGameLeft =
    data.mode === "tournament" && data.round === 1 && hasWon ? true : false;

  const $printBox = document.createElement("div");
  $printBox.classList.add("printBox");
  $app.appendChild($printBox);
  $printBox.appendChild(Result(data.mode, data.leftScore, data.rightScore));
  $printBox.appendChild(EndBtn(data.mode, hasGameLeft));
  if (hasWon || data.mode === "2p") EndConfetti();
}

//  mode | txt         | btn                   | modal
// ==========================================================
//  2p   | w,l / l,w   | exit                  |
// ----------------------------------------------------------
//  norm | win / lose  | friend,exit           |
// ----------------------------------------------------------
//  tour | win / lose  | R1 win  : friend,chat | table,timer
//                     | R1 lose : friend,exit |
//                     | R2      : friend,exit | table
// ==========================================================
