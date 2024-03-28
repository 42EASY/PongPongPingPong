export default function WaitingPlayer(user) {
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

  if (user) {
    $waitingPlayerImage.setAttribute("src", user.image_url);
    $waitingPlayerName.innerHTML = user.nickname;
  } else {
    $waitingPlayerImage.setAttribute("src", "./src/images/none_profile.png");
    $waitingPlayerName.innerHTML = "대전자 찾는 중...";
    $waitingPlayerName.id = "emptyPlayerName";
  }

  return $waitingPlayer;
}
