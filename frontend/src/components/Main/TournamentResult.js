import GameResult from "./GameResult.js";

export default function TournamentResult(data) {
  const $TournamentWrapper = document.createElement("div");
  $TournamentWrapper.classList.add("tournamentWrapper");
  let $TournamentGame;
  for (let i = 0; i < 3; i++) {
    if (data[i].round === "FINAL") data[i].option = "결승";
    else data[i].option = "준결승";
    $TournamentGame = GameResult(data[i]);
    $TournamentWrapper.appendChild($TournamentGame);
  }

  return $TournamentWrapper;
}
