import { getAccessToken, setNewAccessToken } from "../../state/State.js";
import GameResult from "./GameResult.js";
import NoHistory from "./NoHistory.js";

let noHistory = false;
let curPage = 1;
let dataSize = 9;
let isFetching = false;
let hasMore = true;

export default async function GameResults(user_id, isGeneral) {
  noHistory = false;
  curPage = 1;
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

  //scroll event
  document.addEventListener("scroll", async function scrollHandler() {
    const $HistoryBoardTmp = document.querySelector(".historyBoard");
    console.log(user_id);
    if (isFetching || !hasMore) return;
    if (
      window.innerHeight + window.scrollY + 0.5 >=
      document.body.offsetHeight
    ) {
      const newResults = await getGameResults(user_id, isGeneral);
      for (const result of newResults) {
        const $tmp = await GameResult(result);
        $HistoryBoardTmp.appendChild($tmp);
      }
    }
  });

  return $HistoryBoard;
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
      console.log(result);
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
  console.log(page);
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
          console.log(data);
          resolve(data.result);
        } else if (data.code === 401) {
          setNewAccessToken().then((result) => {
            if (result === true) resolve(callGameHistoryApi());
          });
        }
      });
  });
}
