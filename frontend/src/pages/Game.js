import { getMyInfo, getNumberUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";
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
  } else if (data.mode === "TOURNAMENT") {
    const leftInfo = data.player_info;
    $info = Info(leftInfo, rightInfo);
    $board = RemoteBoard(data);
  } else if (data.mode === "NORMAL") {
    const leftUserId =
      data.player_info[0].user_id === getNumberUserId()
        ? data.player_info[1].user_id
        : data.player_info[0].user_id;
    const leftInfo = await getUserInfo(leftUserId);
    $info = Info(leftInfo.result, rightInfo);
    $board = RemoteBoard(data, rightInfo.user_id);
  }

  $page.appendChild($info);
  $page.appendChild($board);
  $app.appendChild($page);
}
