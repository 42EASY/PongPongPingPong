import Result from "../components/Game/GameResult.js";

export default function EndGame(mode, leftScore, rightScore) {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  $app.appendChild(Result(mode, leftScore, rightScore));
  if (leftScore > rightScore) {
    // win
    const $leftConfetti = document.createElement("img");
    const $rightConfetti = document.createElement("img");
    $leftConfetti.classList.add("confetti", "leftConfetti"); // order: -1
    $rightConfetti.classList.add("confetti", "rightConfetti");
    $leftConfetti.setAttribute("src", "./src/images/left_confetti.svg");
    $leftConfetti.setAttribute("alt", "left confetti");
    $rightConfetti.setAttribute("src", "./src/images/right_confetti.svg");
    $leftConfetti.setAttribute("alt", "right confetti");
    $app.appendChild($leftConfetti);
    $app.appendChild($rightConfetti);
  }
}
