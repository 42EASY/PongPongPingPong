import { getAccessToken, setNewAccessToken } from "../../state/State.js";

export default function GameResults(user_id, isGeneral) {
  const $HistoryBoard = document.querySelector(".historyBoard");

  const gameData = callGameHistoryApi(
    user_id,
    isGeneral ? "normal" : "tournament",
    1,
    10
  );
  console.log(gameData);
}

function callGameHistoryApi(user_id, mode, page, size) {
  const url = `http://localhost:8000/api/v1/members/${user_id}/record?mode=${mode}&page=${page}&size=${size}`;

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
        return data.result;
      } else if (data.code === 401) {
        setNewAccessToken();
        callGameHistoryApi();
      }
    });
}
