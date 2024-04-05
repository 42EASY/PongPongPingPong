import GameResult from "./GameResult.js";
import NoHistory from "./NoHistory.js";
import TournamentResult from "./TournamentResult.js";
import GameResults from "./GameResults.js";

const noHistory = false;

const data = {
  option: "CLASSIC",
  game_date: "2024-01-25",
  playtime: "05-11",
  player_one: {
    user_id: 1,
    result: "WIN",
    image_url: "#",
    nickname: "aaaa",
    score: 11,
  },
  player_two: {
    user_id: 2,
    result: "LOSE",
    image_url: "#",
    nickname: "bb",
    score: 4,
  },
};

const data2 = {
  option: "CLASSIC",
  game_date: "2024-01-25",
  playtime: "05-11",
  player_one: {
    user_id: 1,
    result: "LOSE",
    image_url: "#",
    nickname: "aaaa",
    score: 6,
  },
  player_two: {
    user_id: 2,
    result: "WIN",
    image_url: "#",
    nickname: "bb",
    score: 11,
  },
};

const tdata = [
  {
    round: "FINAL",
    game_date: "2024-01-15",
    playtime: "03-20",
    player_one: {
      user_id: 1,
      result: "LOSE",
      image_url: "#",
      nickname: "aaaa",
      score: 11,
    },
    player_two: {
      user_id: 4,
      result: "LOSE",
      image_url: "#",
      nickname: "bb",
      score: 4,
    },
  },
  {
    round: "SEMI_FINAL",
    game_date: "2024-01-15",
    playtime: "04-56",
    player_one: {
      user_id: 1,
      result: "WIN",
      image_url: "#",
      nickname: "cc",
      score: 11,
    },
    player_two: {
      user_id: 2,
      result: "LOSE",
      image_url: "#",
      nickname: "dd",
      score: 10,
    },
  },
  {
    round: "SEMI_FINAL",
    game_date: "2024-01-15",
    playtime: "02-33",
    player_one: {
      user_id: 3,
      result: "LOSE",
      image_url: "#",
      nickname: "e",
      score: 5,
    },
    player_two: {
      user_id: 4,
      result: "WIN",
      image_url: "#",
      nickname: "fffffffff",
      score: 11,
    },
  },
];

export default function GameHistory() {
  const $GameHistoryWrapper = document.createElement("div");
  const $GameHistoryNav = document.createElement("div");
  const $GameHistoryBtn = document.createElement("div");
  const $GameHistoryIcon = document.createElement("i");
  const $TournamentHistoryBtn = document.createElement("div");
  const $TournamentHistoryIcon = document.createElement("i");
  const $HistoryBoard = document.createElement("div");

  $GameHistoryWrapper.appendChild($GameHistoryNav);
  $GameHistoryWrapper.appendChild($HistoryBoard);

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
  $HistoryBoard.classList.add("historyBoard");
  let tmpGameResult = GameResult(data);
  tmpGameResult.style.marginBottom = "16px";
  $HistoryBoard.appendChild(tmpGameResult);
  tmpGameResult = GameResult(data2); //Todo: 2줄 -> 반복문으로 수정
  GameResults(4, false);
  tmpGameResult.style.marginBottom = "16px";
  $HistoryBoard.appendChild(tmpGameResult);

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
