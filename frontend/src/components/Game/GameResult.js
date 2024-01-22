import EndBtn from "../Game/EndBtn.js";

export default function GameResult(mode, leftScore, rightScore) {
    const $resultWrapper = document.createElement("div");
    $resultWrapper.classList.add("resultWrapper");

	const $winOrLose = document.createElement("div");
	const $scores = document.createElement("div");

	$winOrLose.classList.add("winOrLose");
	$scores.classList.add("scores");
	
	$resultWrapper.appendChild($winOrLose);
	$resultWrapper.appendChild($scores);
	$resultWrapper.appendChild(EndBtn(mode));

	$winOrLose.innerHTML = leftScore > rightScore ? "WIN" : "LOSE";
	$scores.innerHTML = leftScore.toString().padStart(2, '0') + " - " + rightScore.toString().padStart(2, '0');

    return $resultWrapper;
}