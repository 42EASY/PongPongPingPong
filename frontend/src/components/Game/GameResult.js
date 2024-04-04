export default function GameResult(mode, leftScore, rightScore) {
  const $resultWrapper = document.createElement("div");
  $resultWrapper.classList.add("resultWrapper");

  const $winOrLose = document.createElement("div");
  const $scores = document.createElement("div");

  $winOrLose.classList.add("winOrLose");
  $scores.classList.add("scores");

  $resultWrapper.appendChild($winOrLose);
  $resultWrapper.appendChild($scores);

  if (mode === "2p")
    $winOrLose.innerHTML = leftScore > rightScore ? "1p WIN" : "2p WIN";
  else $winOrLose.innerHTML = leftScore < rightScore ? "WIN" : "LOSE";
  $scores.innerHTML =
    leftScore.toString().padStart(2, "0") +
    " - " +
    rightScore.toString().padStart(2, "0");

  return $resultWrapper;
}
