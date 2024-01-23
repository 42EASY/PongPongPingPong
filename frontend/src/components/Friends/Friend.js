export default function Friend() {
  const $friendWrapper = document.createElement("div");
  $friendWrapper.classList.add("friendWrapper");

  const $friendInfo = document.createElement("div");
  $friendInfo.classList.add("profileInfo");

  const $friendButton = document.createElement("i");
  $friendButton.classList.add("friendButton", "bi", "bi-three-dots-vertical");
  //todo: 클릭 이벤트 적용

  const $friendImage = document.createElement("img");
  $friendImage.classList.add("profileImg");
  $friendImage.setAttribute("src", "../../images/none_profile.png");
  $friendImage.setAttribute("alt", "profile_image");

  const $friendName = document.createElement("div");
  $friendName.classList.add("profileName");
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
