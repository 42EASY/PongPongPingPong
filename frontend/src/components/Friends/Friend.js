export default function Friend(user) {
  const $friendWrapper = document.createElement("div");
  $friendWrapper.classList.add("friendWrapper");

  const $friendInfo = document.createElement("div");
  $friendInfo.classList.add("profileInfo");

  const $friendButton = document.createElement("i");
  $friendButton.classList.add("friendButton", "bi", "bi-three-dots-vertical");
  //todo: 클릭 이벤트 적용

  const $friendImage = document.createElement("img");
  $friendImage.classList.add("profileImg");
  if (user.image_url === null) user.image_url = "./src/images/none_profile.png";
  $friendImage.setAttribute("src", user.image_url);
  $friendImage.setAttribute("alt", "profile_image");

  const $friendName = document.createElement("div");
  $friendName.classList.add("profileName");
  $friendName.innerHTML = user.nickname;

  const $friendStatus = document.createElement("div");

  //접속중 : online, 게임중 : inGame, 오프라인 : offline
  if (user.status === "OFFLINE")
    $friendStatus.classList.add("friendStatus", "offline");
  else if (user.status === "ONLINE")
    $friendStatus.classList.add("friendStatus", "online");
  else $friendStatus.classList.add("friendStatus", "inGame");

  $friendInfo.appendChild($friendImage);
  $friendInfo.appendChild($friendName);
  $friendInfo.appendChild($friendStatus);

  $friendWrapper.appendChild($friendInfo);
  $friendWrapper.appendChild($friendButton);

  return $friendWrapper;
}
