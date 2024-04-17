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

  const ranking1 = data.find((item) => item.ranking === 1);
  if (ranking1) $tableWrapper.appendChild(PlayerRanking(1, ranking1.nickname));
  const ranking2 = data.find((item) => item.ranking === 2);
  if (ranking2) $tableWrapper.appendChild(PlayerRanking(2, ranking2.nickname));
  const ranking3 = data.filter((item) => item.ranking === 3);
  if (ranking3 && ranking3.length === 2)
    $tableWrapper.appendChild(
      PlayerRanking(3, ranking3[0].nickname, ranking3[1].nickname)
    );

  return $tableWrapper;
}
