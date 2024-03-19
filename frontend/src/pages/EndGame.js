import Result from "../components/Game/GameResult.js";
import EndBtn from "../components/Game/EndBtn.js";
import EndConfetti from "../components/Game/EndConfetti.js";

// argu : mode, score, round
export default function EndGame(mode, leftScore, rightScore, round) {
  //--- hardcoding ---
  mode = "tournament";
  leftScore = 1;
  rightScore = 2;
  round = 2;
  //------------------
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const hasWon = leftScore < rightScore ? true : false;
  const hasGameLeft =
    mode === "tournament" && round === 1 && hasWon ? true : false;

  const $printBox = document.createElement("div");
  $printBox.classList.add("printBox");
  $app.appendChild($printBox);
  $printBox.appendChild(Result(mode, leftScore, rightScore));
  $printBox.appendChild(EndBtn(mode, hasGameLeft));
  if (hasWon || mode === "2p") EndConfetti();
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
