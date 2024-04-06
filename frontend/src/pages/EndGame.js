import Result from "../components/Game/GameResult.js";
import EndBtn from "../components/Game/EndBtn.js";
import EndConfetti from "../components/Game/EndConfetti.js";
import { getUserId } from "../state/State.js";

export default function EndGame({ info, result }) {
  console.log("END GAME: ", info);
  console.log(result);
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  var leftScore, rightScore, opponent_id;
  if (info.mode === "2P") {
    leftScore = result.leftScore;
    rightScore = result.rightScore;
  } else {
    if (result.game_status[0].user_id === getUserId()) {
      // [0]이 본인
      leftScore = result.game_status[0].score;
      rightScore = result.game_status[1].score;
      opponent_id = result.game_status[1].user_id;
    } else {
      // [1]이 본인
      leftScore = result.game_status[1].score;
      rightScore = result.game_status[0].score;
      opponent_id = result.game_status[0].user_id;
    }
  }
  console.log("score : ", leftScore, rightScore);

  const hasWon = leftScore < rightScore ? true : false;
  const hasGameLeft =
    info.mode === "TOURNAMENT" && info.round === "SEMI_FINAL" && hasWon
      ? true
      : false;

  const $printBox = document.createElement("div");
  $printBox.classList.add("printBox");
  $app.appendChild($printBox);
  $printBox.appendChild(Result(info.mode, leftScore, rightScore));
  $printBox.appendChild(EndBtn(info.mode, opponent_id, hasGameLeft)); // opp_id!!!!!!
  if (hasWon || info.mode === "2P") EndConfetti();
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
