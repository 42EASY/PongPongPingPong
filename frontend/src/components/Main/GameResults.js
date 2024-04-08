import { getAccessToken, setNewAccessToken } from "../../state/State.js";
import GameResult from "./GameResult.js";

let noHistory = false;
let curPage = 1;
let dataSize = 9;
let isFetching = false;
let hasMore = true;

export default async function GameResults(user_id, isGeneral) {
  const results = await getGameResults(user_id, isGeneral);
  const $HistoryBoard = document.createElement("div");
  $HistoryBoard.classList.add("historyBoard");

  for (const result of results) {
    const $tmp = await GameResult(result);
    console.log($tmp);
    $HistoryBoard.appendChild($tmp);
  }

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
      if (result.data.length === 0) {
        noHistory = true; //todo: 결과 없음 띄우기
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
