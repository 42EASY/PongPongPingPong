import PercentBar from "./PercentBar.js";

export default function WaitingPlayer(isWaiting) {
  const $waitingPlayer = document.createElement("div");
  const $waitingPlayerImageBox = document.createElement("div");
  const $waitingPlayerImage = document.createElement("img");
  const $waitingPlayerName = document.createElement("div");

  $waitingPlayerImageBox.appendChild($waitingPlayerImage);
  $waitingPlayer.className = "waitingPlayer";
  $waitingPlayerImageBox.id = "waitingPlayerImageBox";
  $waitingPlayerImage.id = "waitingPlayerImage";
  $waitingPlayerImage.setAttribute("alt", "profile_image");
  $waitingPlayerName.id = "waitingPlayerName";

  if (isWaiting) {
    $waitingPlayerImage.setAttribute("src", ""); //default image path
    $waitingPlayerName.innerHTML = "대전자 찾는중...";
    $waitingPlayerName.id = "emptyPlayerName";
  } else {
    $waitingPlayerImage.setAttribute("src", ""); //profile image path
    $waitingPlayerName.innerHTML = "nickname"; //player nickname
  }

  $waitingPlayer.appendChild($waitingPlayerImageBox);
  $waitingPlayer.appendChild($waitingPlayerName);
  $waitingPlayer.appendChild(PercentBar({ win: 60, lose: 40 }));

  return $waitingPlayer;
}
