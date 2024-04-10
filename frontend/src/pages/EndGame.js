import Result from "../components/Game/GameResult.js";
import EndBtn from "../components/Game/EndBtn.js";
import EndConfetti from "../components/Game/EndConfetti.js";
import { getUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";

export default async function EndGame({ info, result }) {
  console.log("END GAME: ", info, result);
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  var leftScore, rightScore, opponent;
  if (info.mode === "2P") {
    leftScore = result.leftScore;
    rightScore = result.rightScore;
    opponent = getUserId();
  } else {
    if (result.game_status[0].user_id === Number(getUserId())) {
      // [1]상대 / [0]본인
      leftScore = result.game_status[1].score;
      rightScore = result.game_status[0].score;
      opponent = await getUserInfo(result.game_status[1].user_id);
    } else {
      // [0]상대 / [1]본인
      leftScore = result.game_status[0].score;
      rightScore = result.game_status[1].score;
      opponent = await getUserInfo(result.game_status[0].user_id);
    }
  }
  const hasWon = leftScore < rightScore ? true : false;
  const hasGameLeft =
    info.mode === "TOURNAMENT" && info.round === "SEMI_FINAL" && hasWon
      ? true
      : false;

  const $printBox = document.createElement("div");
  $printBox.classList.add("printBox");
  $app.appendChild($printBox);
  $printBox.appendChild(Result(info.mode, leftScore, rightScore));
  $printBox.appendChild(EndBtn(info.mode, opponent.result, hasGameLeft));
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
