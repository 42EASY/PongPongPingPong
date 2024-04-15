import Result from "../components/Game/GameResult.js";
import EndBtn from "../components/Game/EndBtn.js";
import EndConfetti from "../components/Game/EndConfetti.js";
import changeUrl from "../Router.js";
import { getUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";
import Modal from "../components/Modal/Modal.js";

export default async function EndGame({ info, result }) {
  console.log("END GAME: ", info, result);
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  var leftScore, rightScore, opponent, isWin;
  if (info.mode === "2P") {
    leftScore = result.leftScore;
    rightScore = result.rightScore;
    opponent = getUserId();
  } else {
    if (result.game_status[0].user_id === Number(getUserId())) {
      // [1]상대 / [0]본인
      leftScore = result.game_status[1].score;
      rightScore = result.game_status[0].score;
      isWin = result.game_status[0].result === "WIN";
      opponent = await getUserInfo(result.game_status[1].user_id);
    } else {
      // [0]상대 / [1]본인
      leftScore = result.game_status[0].score;
      rightScore = result.game_status[1].score;
      isWin = result.game_status[1].result === "WIN";
      opponent = await getUserInfo(result.game_status[0].user_id);
    }
  }

  var hasGameLeft = false;
  if (info.mode === "TOURNAMENT") {
    hasGameLeft =
      info.round === "SEMI_FINAL" && isWin;
  }
  const $printBox = document.createElement("div");
  $printBox.classList.add("printBox");
  $app.appendChild($printBox);
  $printBox.appendChild(
    Result(info.mode, isWin, leftScore, rightScore)
  );
  $printBox.appendChild(EndBtn(info.mode, opponent.result, hasGameLeft));
  if (info.mode === "2P" || isWin ) EndConfetti();

  if (hasGameLeft) {
    let sec = 5;
    setTimeout(() => {
      Modal("gameRoom");
    }, sec * 1000);
    sec = 8;
    setTimeout(() => {
      changeUrl("/gameroom", { round: "FINAL", room_id: info.room_id });
    }, sec * 1000);
  }
}

//  mode | txt         | btn                   | modal
// ==========================================================
//  2p   | ?p win      | exit                  |
// ----------------------------------------------------------
//  norm | win / lose  | friend,exit           |
// ----------------------------------------------------------
//  tour | win / lose  | SF win  : friend      | gameRoom
//                     | SF lose : friend,exit |
//                     | FN      : friend,exit |
//                     | FN lose : friend,exit |
// ==========================================================
