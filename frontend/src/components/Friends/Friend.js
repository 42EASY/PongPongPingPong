export default function Friend() {
  const $friendWrapper = document.createElement("div");
  $friendWrapper.classList.add("friendWrapper");

  const $friendInfo = document.createElement("div");
  $friendInfo.classList.add("friendInfo");

  const $friendButton = document.createElement("i");
  $friendButton.classList.add("friendButton", "bi", "bi-three-dots-vertical");

  const $friendImage = document.createElement("img");
  $friendImage.classList.add("friendImage");
  $friendImage.setAttribute("src", "../../images/none_profile.png");
  $friendImage.setAttribute("alt", "profile_image");

  const $friendName = document.createElement("div");
  $friendName.classList.add("friendName");
  $friendName.innerHTML = "이름";

  const $friendStatus = document.createElement("div");
  $friendStatus.classList.add("friendStatus", "online");
  //접속중 : online, 게임중 : inGame, 오프라인 : offline

  $friendInfo.appendChild($friendImage);
  $friendInfo.appendChild($friendName);
  $friendInfo.appendChild($friendStatus);

  $friendWrapper.appendChild($friendInfo);
  $friendWrapper.appendChild($friendButton);

  return $friendWrapper;
}
