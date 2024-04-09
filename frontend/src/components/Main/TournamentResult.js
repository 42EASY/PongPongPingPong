import GameResult from "./GameResult.js";

export default async function TournamentResult(userId, data) {
  const $TournamentWrapper = document.createElement("div");
  $TournamentWrapper.classList.add("tournamentWrapper");
  let $TournamentGame;
  console.log(data);
  for (let i = 2; i >= 0; i--) {
    if (data[i].round === "FINAL") data[i].option = "결승";
    else data[i].option = "준결승";
    $TournamentGame = await GameResult(userId, data[i]);
    $TournamentWrapper.appendChild($TournamentGame);
  }

  return $TournamentWrapper;
}
