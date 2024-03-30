function PlayerRanking(ranking, nickname, nickname2) {
  const $rankingWrapper = document.createElement("div");
  $rankingWrapper.classList.add("rankingWrapper");

  const $rankingBox = document.createElement("div");
  $rankingBox.classList.add("rankingBox");
  $rankingBox.innerHTML = ranking;
  $rankingWrapper.appendChild($rankingBox);

  const $ordinalNum = document.createElement("div");
  $ordinalNum.classList.add("ordinalNum");
  if (ranking === 1) $ordinalNum.innerHTML = "st";
  else if (ranking === 2) $ordinalNum.innerHTML = "nd";
  else $ordinalNum.innerHTML = "rd";
  $rankingBox.appendChild($ordinalNum);

  const $playerBox = document.createElement("div");
  $rankingWrapper.appendChild($playerBox);
  if (ranking === 1) $playerBox.classList.add("playerBoxSelected");
  if (nickname2 !== undefined) {
    $playerBox.classList.add("playerBox3rd");
    const $player1 = document.createElement("div");
    const $player2 = document.createElement("div");
    $player1.classList.add("playerBox3rd");
    $player2.classList.add("playerBox3rd");
    $player1.innerHTML = nickname;
    $player2.innerHTML = nickname2;
    $player1.classList.add("player3rd");
    $player2.classList.add("player3rd");
    $playerBox.appendChild($player1);
    $playerBox.appendChild($player2);
  } else {
    $playerBox.classList.add("playerBox");
    $playerBox.append(nickname);
  }

  return $rankingWrapper;
}

export default function GameResultTable(data) {
  const $tableWrapper = document.createElement("div");
  $tableWrapper.classList.add("tableWrapper");

  if (data.some((item) => item.ranking === 1))
    $tableWrapper.appendChild(PlayerRanking(1, data[0].nickname));
  if (data.some((item) => item.ranking === 2))
    $tableWrapper.appendChild(PlayerRanking(2, data[1].nickname));
  if (data.some((item) => item.ranking === 3))
    $tableWrapper.appendChild(
      PlayerRanking(3, data[2].nickname, data[3].nickname)
    );

  return $tableWrapper;
}
