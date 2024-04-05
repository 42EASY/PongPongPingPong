import Nav from "./Nav.js";
import Profile from "../components/Main/Profile.js";
import GameHistory from "../components/Main/GameHistory.js";
import { getUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";

export default async function Main() {
  Nav();

  const $app = document.querySelector(".App");
  $app.innerHTML = "";
  const $page = document.createElement("div");
  $app.appendChild($page);

  let id;
  const segPath = window.location.pathname.split("=").filter(Boolean);
  if (segPath.length === 2) id = segPath[1];
  else id = getUserId();

  const userInfo = await getUserInfo(id);
  const $profile = Profile(id, userInfo.result);

  $page.appendChild($profile);
  $page.classList.add("main");

  const $history = GameHistory(id);
  $page.appendChild($history);
}
