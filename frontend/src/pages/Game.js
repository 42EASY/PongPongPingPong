import { getUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";
import Info from "../components/Game/Info.js";
import Board from "../components/Game/Board.js";
import Modal from "../components/Modal/Modal.js";

// <data>
// mode : 2p / normal / tournament
// option : classic / speed
// Game(상대id, mode, option)????round??

export default async function Game(data) {
  console.log("GAME: ", data);
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $page = document.createElement("div");
  $page.classList.add("page");

  const opponentInfo = await getUserInfo(1);
  const myInfo = await getUserInfo(1);

  const $info = Info(opponentInfo.result, myInfo.result);
  const $board = Board(data);

  $page.appendChild($info);
  $page.appendChild($board);
  $app.appendChild($page);
}
