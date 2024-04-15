import { getUserId } from "../state/State.js";
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
  const rightUserId = Number(getUserId());
  const rightInfo = await getUserInfo(rightUserId);

  var $info, $board;
  if (data.mode === "2P") {
    $info = await Info(rightInfo.result, rightInfo.result);
    $board = Board(data, rightUserId);
  } else {
    const leftUserId =
      data.player_info[0].user_id === Number(getUserId())
        ? data.player_info[1].user_id
        : data.player_info[0].user_id;
    const leftInfo = await getUserInfo(leftUserId);
    $info = await Info(leftInfo.result, rightInfo.result);
    $board = RemoteBoard(data, rightUserId);
  }

  $page.appendChild($info);
  $page.appendChild($board);
  $app.appendChild($page);
}
