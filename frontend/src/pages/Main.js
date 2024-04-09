import Nav from "./Nav.js";
import Profile from "../components/Main/Profile.js";
import GameHistory from "../components/Main/GameHistory.js";
import { GameResultsScroll } from "../components/Main/GameResults.js";
import { getUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";

let scrollEvent;

export default async function Main() {
  Nav();

  const $app = document.querySelector(".App");
  $app.innerHTML = "";
  const $page = document.createElement("div");
  $page.classList.add("mainWrapper");
  $app.appendChild($page);

  let id;
  const segPath = window.location.pathname.split("=").filter(Boolean);
  if (segPath.length === 2) id = segPath[1];
  else id = getUserId();

  const userInfo = await getUserInfo(id);
  console.log(userInfo);
  const $profile = await Profile(id, userInfo.result);

  $page.appendChild($profile);
  $page.classList.add("main");

  const $history = await GameHistory(id);
  $page.appendChild($history);

  //scroll event
  if (scrollEvent) document.removeEventListener("scroll", scrollEvent);
  scrollEvent = scrollEventHandler;
  document.addEventListener("scroll", scrollEventHandler);
}

async function scrollEventHandler() {
  if (window.innerHeight + window.scrollY + 0.5 >= document.body.offsetHeight) {
    let id;
    const segPath = window.location.pathname.split("=").filter(Boolean);
    if (segPath.length === 2) id = segPath[1];
    else id = getUserId();

    const $GameHistoryBtn = document.querySelector(".historyBtn");
    const isGeneral = $GameHistoryBtn.classList.contains("historyBtnSelected");

    await GameResultsScroll(id, isGeneral);
  }
}
