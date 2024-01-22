import Nav from "./Nav.js";
import Chat from "../pages/Chat.js";
import Profile from "../components/Main/Profile.js";
import GameHistory from "../components/Main/GameHistory.js";

export default function Main() {
  Nav();
  Chat();

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
