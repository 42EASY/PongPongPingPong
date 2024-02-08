import Nav from "./Nav.js";
import Chat from "./Chat.js";
import Friends from "./Friends.js";
import Profile from "../components/Main/Profile.js";
import GameHistory from "../components/Main/GameHistory.js";
import Modal from "../components/Modal/Modal.js";

export default function Main() {
  Nav();

  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $page = document.createElement("div");
  const $profile = Profile();

  $page.appendChild($profile);
  $page.classList.add("main");

  const $history = GameHistory();
  $page.appendChild($history);

  $app.appendChild($page);
}
