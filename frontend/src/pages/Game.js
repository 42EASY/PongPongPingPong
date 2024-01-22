import Info from "../components/Game/Info.js";
import Board from "../components/Game/Board.js";

export default function Game() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $page = document.createElement("div");
  $page.classList.add("page");

  const $info = Info();
  const $board = Board("tournament");

  $page.appendChild($info);
  $page.appendChild($board);
  $app.appendChild($page);
}
