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
  const $HistoryBoard = await GameResults(user_id, true);
  $GameHistoryWrapper.appendChild($HistoryBoard);

  $GameHistoryBtn.onclick = () => {
    if (!$GameHistoryBtn.classList.contains("historyBtnSelected")) {
      $GameHistoryBtn.classList.add("historyBtnSelected");
      $HistoryBoard.innerHTML = "";
      if (!noHistory) $HistoryBoard.appendChild(GameResult(data));
      else $HistoryBoard.appendChild(NoHistory());
    }
    $TournamentHistoryBtn.classList.remove("historyBtnSelected");
  };

  $TournamentHistoryBtn.onclick = () => {
    if (!$TournamentHistoryBtn.classList.contains("historyBtnSelected")) {
      $TournamentHistoryBtn.classList.add("historyBtnSelected");
      $HistoryBoard.innerHTML = "";
      if (!noHistory) {
        $HistoryBoard.appendChild(TournamentResult(tdata));
        $HistoryBoard.appendChild(TournamentResult(tdata));
      } else $HistoryBoard.appendChild(NoHistory());
    }
    $GameHistoryBtn.classList.remove("historyBtnSelected");
  };

  return $GameHistoryWrapper;
}
