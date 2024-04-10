import { getUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";
import Info from "../components/Game/Info.js";
import Board from "../components/Game/Board.js";

export default async function Game(data) {
  console.log("GAME: ", data);
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $page = document.createElement("div");
  $page.classList.add("page");

  // 본인
  const rightUserId = Number(getUserId());
  const rightInfo = await getUserInfo(rightUserId);
  // 상대
  const leftUserId =
    data.player_info[0].user_id === Number(getUserId())
      ? data.player_info[1].user_id
      : data.player_info[0].user_id;
  const leftInfo = await getUserInfo(leftUserId);

  const $info = await Info(leftInfo.result, rightInfo.result);
  const $board = Board(data, rightUserId);

  $page.appendChild($info);
  $page.appendChild($board);
  $app.appendChild($page);
}
