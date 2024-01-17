import Nav from "../components/Nav/Nav.js";
import Profile from "../components/Main/Profile.js";
import GameHistory from "../components/Main/GameHistory.js";

export default function Main() {
  const $navbar = document.querySelector(".nav");
  $navbar.innerHTML = Nav().innerHTML;

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
