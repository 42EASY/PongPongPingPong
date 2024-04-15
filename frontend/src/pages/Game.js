import { getMyInfo } from "../state/State.js";
import Info from "../components/Game/Info.js";
import Board from "../components/Game/Board.js";
import RemoteBoard from "../components/Game/RemoteBoard.js";

export default async function Game(data) {
  console.log("GAME: ", data);
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $page = document.createElement("div");
  $page.classList.add("page");

  // 본인
  const rightInfo = getMyInfo();

  var $info, $board;
  if (data.mode === "2P") {
    $info = Info(rightInfo, rightInfo);
    $board = Board(data, rightInfo.user_id);
  } else {
    const leftInfo = data.player_info;
    $info = Info(leftInfo, rightInfo);
    $board = RemoteBoard(data);
  }

  $page.appendChild($info);
  $page.appendChild($board);
  $app.appendChild($page);
}
