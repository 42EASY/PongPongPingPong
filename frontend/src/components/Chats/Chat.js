export default function Chat() {
  const $chatWrapper = document.createElement("div");
  $chatWrapper.classList.add("chatWrapper");

  const $profileInfo = document.createElement("div");
  $profileInfo.classList.add("profileInfo");

  const $profileImg = document.createElement("img");
  $profileImg.setAttribute("src", "../../images/none_profile.png");
  $profileImg.setAttribute("alt", "profileImg");
  $profileImg.classList.add("profileImg");

  const $profileName = document.createElement("div");
  $profileName.classList.add("profileName");
  $profileName.innerText = "이름";

  const $chatStatus = document.createElement("div");
  $chatStatus.classList.add("chatStatus");
  $chatStatus.innerText = "1";

  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg"); //

  $profileInfo.appendChild($profileImg);
  $profileInfo.appendChild($profileName);

  $chatWrapper.appendChild($profileInfo);
  $chatWrapper.appendChild($chatStatus);

  return $chatWrapper;
}
