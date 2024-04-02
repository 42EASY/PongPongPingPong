import { getUserId, getNickname } from "../../state/State.js";

function MatchedPlayer(player1, player2) {
  const $matchedWrapper = document.createElement("div");
  $matchedWrapper.classList.add("matchedWrapper");

  const $player1Box = document.createElement("div");
  $player1Box.classList.add("playerBox");
  $player1Box.innerHTML = player1.nickname;
  $matchedWrapper.appendChild($player1Box);

  const $versusBox = document.createElement("div");
  $versusBox.classList.add("versusBox");
  $versusBox.innerHTML = "VS";
  $matchedWrapper.appendChild($versusBox);

  const $player2Box = document.createElement("div");
  $player2Box.classList.add("playerBox");
  $player2Box.innerHTML = player2.nickname;
  $matchedWrapper.appendChild($player2Box);

  if (player1.user_id === getUserId())
    $player1Box.classList.add("playerBoxSelected");
  else if (player2.user_id === getUserId())
    $player2Box.classList.add("playerBoxSelected");

  return $matchedWrapper;
}

export default function TournamentTable(data) {
  const $tableWrapper = document.createElement("div");
  $tableWrapper.classList.add("tableWrapper");

  if (!Array.isArray(data)) {
    $tableWrapper.appendChild(
      MatchedPlayer({ user_id: getUserId(), nickname: getNickname() }, data)
    );
  } else if (data.length === 4) {
    $tableWrapper.appendChild(MatchedPlayer(data[0], data[1]));
    $tableWrapper.appendChild(MatchedPlayer(data[2], data[3]));
  }

  return $tableWrapper;
}
