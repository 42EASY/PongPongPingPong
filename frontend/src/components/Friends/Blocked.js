export default function Blocked() {
  const $blockedWrapper = document.createElement("div");
  $blockedWrapper.classList.add("friendWrapper");

  const $blockedInfo = document.createElement("div");
  $blockedInfo.classList.add("profileInfo");

  const $blockedButton = document.createElement("div");
  $blockedButton.classList.add("blockedButton");
  $blockedButton.innerHTML = "차단 해제";
  //todo: 클릭 이벤트 적용

  const $blockedImage = document.createElement("img");
  $blockedImage.classList.add("profileImg");
  $blockedImage.setAttribute("src", "../../images/none_profile.png");
  $blockedImage.setAttribute("alt", "profile_image");

  const $blockedName = document.createElement("div");
  $blockedName.classList.add("profileName");
  $blockedName.innerHTML = "이름";

  $blockedInfo.appendChild($blockedImage);
  $blockedInfo.appendChild($blockedName);

  $blockedWrapper.appendChild($blockedInfo);
  $blockedWrapper.appendChild($blockedButton);

  return $blockedWrapper;
}
