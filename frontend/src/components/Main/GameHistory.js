import GameResult from "./GameResult.js";
import NoHistory from "./NoHistory.js";
import TournamentResult from "./TournamentResult.js";
import { GameResults } from "./GameResults.js";

const noHistory = false;

export default async function GameHistory(user_id) {
  const $GameHistoryWrapper = document.createElement("div");
  const $GameHistoryNav = document.createElement("div");
  const $GameHistoryBtn = document.createElement("div");
  const $GameHistoryIcon = document.createElement("i");
  const $TournamentHistoryBtn = document.createElement("div");
  const $TournamentHistoryIcon = document.createElement("i");

  $GameHistoryWrapper.appendChild($GameHistoryNav);

  $GameHistoryWrapper.classList.add("historyWrapper");
  $GameHistoryNav.classList.add("historyNav");
  $GameHistoryNav.appendChild($GameHistoryBtn);
  $GameHistoryNav.appendChild($TournamentHistoryBtn);
  $GameHistoryIcon.classList.add("bi", "bi-grid", "historyIcon");
  $GameHistoryBtn.classList.add("historyBtn", "historyBtnSelected");
  $GameHistoryBtn.appendChild($GameHistoryIcon);
  $GameHistoryBtn.append("경기 전적");
  $TournamentHistoryIcon.classList.add("bi", "bi-grid", "historyIcon");
  $TournamentHistoryBtn.classList.add("historyBtn");
  $TournamentHistoryBtn.appendChild($TournamentHistoryIcon);
  $TournamentHistoryBtn.append("토너먼트 전적");
  var $HistoryBoard = await GameResults(user_id, true);
  $GameHistoryWrapper.appendChild($HistoryBoard);

  //경기 전적 클릭이벤트
  $GameHistoryBtn.addEventListener("click", async () => {
    if ($GameHistoryBtn.classList.contains("historyBtnSelected")) return;

    $GameHistoryBtn.classList.add("historyBtnSelected");
    $TournamentHistoryBtn.classList.remove("historyBtnSelected");
    $HistoryBoard.remove();
    $HistoryBoard = await GameResults(user_id, true);
    $GameHistoryWrapper.appendChild($HistoryBoard);
  });

  //토너먼트 전적 클릭이벤트
  $TournamentHistoryBtn.addEventListener("click", async () => {
    if ($TournamentHistoryBtn.classList.contains("historyBtnSelected")) return;

    $TournamentHistoryBtn.classList.add("historyBtnSelected");
    $GameHistoryBtn.classList.remove("historyBtnSelected");
    $HistoryBoard.remove();
    $HistoryBoard = await GameResults(user_id, false);
    $GameHistoryWrapper.appendChild($HistoryBoard);
  });

  return $GameHistoryWrapper;
}
