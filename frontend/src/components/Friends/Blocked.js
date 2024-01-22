export default function Blocked() {
  const $blockedWrapper = document.createElement("div");
  $blockedWrapper.classList.add("friendWrapper");

  const $blockedInfo = document.createElement("div");
  $blockedInfo.classList.add("friendInfo");

  const $blockedButton = document.createElement("div");
  $blockedButton.classList.add("blockedButton");
  $blockedButton.innerHTML = "차단 해제";

  const $blockedImage = document.createElement("img");
  $blockedImage.classList.add("friendImage");
  $blockedImage.setAttribute("src", "../../images/none_profile.png");
  $blockedImage.setAttribute("alt", "profile_image");

  const $blockedName = document.createElement("div");
  $blockedName.classList.add("friendName");
  $blockedName.innerHTML = "이름";

  $blockedInfo.appendChild($blockedImage);
  $blockedInfo.appendChild($blockedName);

  $blockedWrapper.appendChild($blockedInfo);
  $blockedWrapper.appendChild($blockedButton);

  return $blockedWrapper;
}
