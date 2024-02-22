import PercentBar from "./PercentBar.js";
import TimerRing from "./TimerRing.js";

export default function WaitingPlayer(state) {
  const $waitingPlayer = document.createElement("div");
  const $waitingPlayerImageBox = document.createElement("div");
  const $waitingPlayerImage = document.createElement("img");
  const $waitingPlayerName = document.createElement("div");

  $waitingPlayerImageBox.appendChild($waitingPlayerImage);
  $waitingPlayer.className = "waitingPlayer";
  $waitingPlayerImageBox.classList.add("waitingPlayerImageBox");
  $waitingPlayerImage.id = "waitingPlayerImage";
  $waitingPlayerImage.setAttribute("alt", "profile_image");
  $waitingPlayerName.id = "waitingPlayerName";
  $waitingPlayer.appendChild($waitingPlayerImageBox);
  $waitingPlayer.appendChild($waitingPlayerName);

  if (state == 1) {
    $waitingPlayerImage.setAttribute("src", "./src/images/none_profile.png");
    $waitingPlayerName.innerHTML = "대전자 찾는 중...";
    $waitingPlayerName.id = "emptyPlayerName";
    $waitingPlayer.appendChild(PercentBar({ win: 0, lose: 0 }));
  } else if (state == 2) {
    $waitingPlayerImageBox.innerHTML = "";
    $waitingPlayerImageBox.appendChild(TimerRing());
    $waitingPlayerImageBox.style.backgroundColor = "transparent";
    $waitingPlayerName.innerHTML = "nickname님을 기다리는 중...";
    $waitingPlayerName.id = "emptyPlayerName";
    $waitingPlayer.appendChild(PercentBar({ win: 0, lose: 0 }));
  } else {
    $waitingPlayerImage.setAttribute("src", ""); //profile image path
    $waitingPlayerName.innerHTML = "nickname"; //player nickname
    $waitingPlayer.appendChild(PercentBar({ win: 6, lose: 4 }));
  }

  return $waitingPlayer;
}
