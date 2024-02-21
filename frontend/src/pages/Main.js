import Nav from "./Nav.js";
import Profile from "../components/Main/Profile.js";
import GameHistory from "../components/Main/GameHistory.js";
import { getUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";

export default async function Main(id = getUserId()) {
  Nav();

  const $app = document.querySelector(".App");
  $app.innerHTML = "";
  const $page = document.createElement("div");
  $app.appendChild($page);

  const userInfo = await getUserInfo(id);
  const $profile = Profile(id, userInfo.result);

  $page.appendChild($profile);
  $page.classList.add("main");

  const $history = GameHistory();
  $page.appendChild($history);
}
