import { getUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";
import Info from "../components/Game/Info.js";
import Board from "../components/Game/Board.js";
import Modal from "../components/Modal/Modal.js";

export default async function Game(data) {
  console.log("GAME: ", data);
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $page = document.createElement("div");
  $page.classList.add("page");

  const $info = await Info(data);
  const $board = await Board(data);

  $page.appendChild($info);
  $page.appendChild($board);
  $app.appendChild($page);
}
