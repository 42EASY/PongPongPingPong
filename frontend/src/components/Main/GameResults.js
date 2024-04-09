import { getAccessToken, setNewAccessToken } from "../../state/State.js";
import GameResult from "./GameResult.js";
import NoHistory from "./NoHistory.js";

let noHistory = false;
let curPage = 1;
let dataSize = 9;
let isFetching = false;
let hasMore = true;

export async function GameResults(user_id, isGeneral) {
  curPage = 1;
  noHistory = false;
  hasMore = true;

  const $HistoryBoard = document.createElement("div");
  $HistoryBoard.classList.add("historyBoard");
  const results = await getGameResults(user_id, isGeneral);

  if (results.length === 0) {
    noHistory = true;
    $HistoryBoard.appendChild(NoHistory());
    return $HistoryBoard;
  }

  for (const result of results) {
    const $tmp = await GameResult(result);
    $HistoryBoard.appendChild($tmp);
  }

  return $HistoryBoard;
}

export async function GameResultsScroll(user_id, isGeneral) {
  if (isFetching || !hasMore) return;

  const $HistoryBoard = document.querySelector(".historyBoard");
  const results = await getGameResults(user_id, isGeneral);

  for (const result of results) {
    const $tmp = await GameResult(result);
    $HistoryBoard.appendChild($tmp);
  }
}

async function getGameResults(user_id, isGeneral) {
  return new Promise((resolve) => {
    isFetching = true;
    callGameHistoryApi(
      user_id,
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

function callGameHistoryApi(user_id, mode, page, size) {
  return new Promise((resolve) => {
    const url = `http://localhost:8000/api/v1/members/${user_id}/records?mode=${mode}&page=${page}&size=${size}`;

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
