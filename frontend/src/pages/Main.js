import Nav from "./Nav.js";
import Profile from "../components/Main/Profile.js";
import GameHistory from "../components/Main/GameHistory.js";
import { GameResultsScroll } from "../components/Main/GameResults.js";
import { getUserId } from "../state/State.js";
import { getUserInfo } from "../components/Main/UserApi.js";

export default async function Main() {
  Nav();

  document.body.style.overflow = "auto";
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
  const $profile = await Profile(id, userInfo.result);

  $page.appendChild($profile);
  $page.classList.add("main");

  const $history = await GameHistory(id);
  $page.appendChild($history);

  //scroll event
  document.addEventListener("scroll", async () => {
    console.log(window.innerHeight, window.scrollY, document.body.offsetHeight);
    if (window.innerHeight + window.scrollY + 2 >= document.body.offsetHeight) {
      let id;
      const segPath = window.location.pathname.split("=").filter(Boolean);
      if (segPath.length === 2) id = segPath[1];
      else id = getUserId();

      const $GameHistoryBtn = document.querySelector(".historyBtn");
      const isGeneral =
        $GameHistoryBtn.classList.contains("historyBtnSelected");

      await GameResultsScroll(id, isGeneral);
    }
  });
}
