import { getAccessToken, setNewAccessToken } from "../../state/State.js";
import GameResult from "./GameResult.js";

let noHistory = false;
let curPage = 1;
let dataSize = 9;
let isFetching = false;
let hasMore = true;

export default function GameResults(user_id, isGeneral) {
  const $HistoryBoard = document.querySelector(".historyBoard");
  getGameResults(user_id, isGeneral).then((result) => {
    console.log(result);
    result.forEach((data) => {
      const tmp = GameResult(data); //todo: null인 이유 확인
      $HistoryBoard.appendChild(tmp);
    });
  });
}

function getGameResults(user_id, isGeneral) {
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
          setNewAccessToken();
          callGameHistoryApi();
        }
      });
  });
}
