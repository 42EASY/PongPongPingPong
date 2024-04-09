import { getAccessToken, setNewAccessToken } from "../../state/State.js";
import GameResult from "./GameResult.js";
import NoHistory from "./NoHistory.js";
import TournamentResult from "./TournamentResult.js";

let noHistory = false;
let curPage = 1;
let dataSize = 9;
let isFetching = false;
let hasMore = true;

export async function GameResults(userId, isGeneral) {
  curPage = 1;
  noHistory = false;
  hasMore = true;

  const $HistoryBoard = document.createElement("div");
  $HistoryBoard.classList.add("historyBoard");
  const results = await getGameResults(userId, isGeneral);
  console.log(results);

  if (results.length === 0) {
    noHistory = true;
    $HistoryBoard.appendChild(NoHistory());
    return $HistoryBoard;
  }

  if (isGeneral) {
    for (const result of results) {
      const $tmp = await GameResult(userId, result);
      $HistoryBoard.appendChild($tmp);
    }
  } else {
    const resultsTmp = results[0].tournament;
    for (const result of resultsTmp) {
      const $tmp = await TournamentResult(userId, result);
      $HistoryBoard.appendChild($tmp);
    }
  }

  return $HistoryBoard;
}

export async function GameResultsScroll(userId, isGeneral) {
  if (isFetching || !hasMore) return;

  const $HistoryBoard = document.querySelector(".historyBoard");
  const results = await getGameResults(userId, isGeneral);

  for (const result of results) {
    const $tmp = await GameResult(userId, result);
    $HistoryBoard.appendChild($tmp);
  }
}

async function getGameResults(userId, isGeneral) {
  return new Promise((resolve) => {
    isFetching = true;
    callGameHistoryApi(
      userId,
      isGeneral ? "NORMAL" : "TOURNAMENT",
      curPage,
      dataSize
    ).then((result) => {
      isFetching = false;
      if (
        result.total_page === curPage ||
        result.data.length === 0 ||
        result.data.length < dataSize
      ) {
        hasMore = false;
      } else {
        curPage++;
      }
      resolve(result.data);
    });
  });
}

function callGameHistoryApi(userId, mode, page, size) {
  return new Promise((resolve) => {
    const url = `http://localhost:8000/api/v1/members/${userId}/records?mode=${mode}&page=${page}&size=${size}`;

    fetch(url, {
      method: "GET",
      headers: {
        "content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          resolve(data.result);
        } else if (data.code === 401) {
          setNewAccessToken().then((result) => {
            if (result === true) resolve(callGameHistoryApi());
          });
        }
      });
  });
}
