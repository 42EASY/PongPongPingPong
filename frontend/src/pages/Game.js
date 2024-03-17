import { getUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";
import Info from "../components/Game/Info.js";
import Board from "../components/Game/Board.js";

// 2p / normal / tournament
// classic / speed
// Game(상대id, mode, option)

export default async function Game() {
  // ---- hard coding ----
  const opponentInfo = {
    result: { id: 1, image_url: "./src/images/42_logo.png", nickname: "opp" },
  };
  const myInfo = {
    result: { id: 2, image_url: "./src/images/sponge.png", nickname: "me" },
  };
  const mode = "2p";
  const option = "classic";
  // ----------------------

  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $page = document.createElement("div");
  $page.classList.add("page");

  // const opponentInfo = await getUserInfo(id);
  // const myInfo = await getUserInfo(1);

  const $info = Info(opponentInfo.result, myInfo.result);
  const $board = Board(mode, option);

  $page.appendChild($info);
  $page.appendChild($board);
  $app.appendChild($page);
}
