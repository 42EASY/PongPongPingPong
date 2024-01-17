import GameResult from "./GameResult.js";
import NoHistory from "./NoHistory.js";
import TournamentResult from "./TournamentResult.js";

const noHistory = true;

const data = {
  option: "CLASSIC",
  game_date: "2024-01-25",
  result: "WIN",
  playtime: "05-11",
  player_one: {
    user_id: 1,
    image_url: "#",
    nickname: "aaaa",
    score: 11,
  },
  player_two: {
    user_id: 2,
    image_url: "#",
    nickname: "bb",
    score: 4,
  },
};

const data2 = {
  option: "CLASSIC",
  game_date: "2024-01-25",
  result: "LOSE",
  playtime: "05-11",
  player_one: {
    user_id: 1,
    image_url: "#",
    nickname: "aaaa",
    score: 6,
  },
  player_two: {
    user_id: 2,
    image_url: "#",
    nickname: "bb",
    score: 11,
  },
};

const tdata = [
  {
    round: "FINAL",
    game_date: "2024-01-15",
    result: "WIN",
    playtime: "03-20",
    player_one: {
      user_id: 1,
      image_url: "#",
      nickname: "aaaa",
      score: 11,
    },
    player_two: {
      user_id: 2,
      image_url: "#",
      nickname: "bb",
      score: 4,
    },
  },
  {
    round: "SEMI_FINAL",
    game_date: "2024-01-15",
    result: "WIN",
    playtime: "04-56",
    player_one: {
      user_id: 1,
      image_url: "#",
      nickname: "cc",
      score: 11,
    },
    player_two: {
      user_id: 2,
      image_url: "#",
      nickname: "dd",
      score: 10,
    },
  },
  {
    round: "SEMI_FINAL",
    game_date: "2024-01-15",
    result: "LOSE",
    playtime: "02-33",
    player_one: {
      user_id: 1,
      image_url: "#",
      nickname: "e",
      score: 5,
    },
    player_two: {
      user_id: 2,
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
  $GameHistoryIcon.classList.add("bi", "bi-grid");
  $GameHistoryBtn.classList.add("historyBtn", "historyBtnSelected");
  $GameHistoryBtn.appendChild($GameHistoryIcon);
  $GameHistoryBtn.append("경기 전적");
  $TournamentHistoryIcon.classList.add("bi", "bi-grid");
  $TournamentHistoryBtn.classList.add("historyBtn");
  $TournamentHistoryBtn.appendChild($TournamentHistoryIcon);
  $TournamentHistoryBtn.append("토너먼트 전적");
  $HistoryBoard.classList.add("historyBoard");
  let tmpGameResult = GameResult(data);
  tmpGameResult.style.marginBottom = "16px";
  $HistoryBoard.appendChild(tmpGameResult);
  tmpGameResult = GameResult(data2); //Todo: 2줄 -> 반복문으로 수정
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
