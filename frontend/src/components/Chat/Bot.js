import BotRoom from "../../pages/BotRoom.js";

export default function Bot(cnt) {
  const $botWrapper = document.createElement("div");
  $botWrapper.classList.add("chatWrapper");

  const $profileInfo = document.createElement("div");
  $profileInfo.classList.add("profileInfo");

  const $profileImg = document.createElement("img");
  $profileImg.setAttribute("src", "./src/images/sponge.png");
  $profileImg.setAttribute("alt", "botProfileImg");
  $profileImg.classList.add("profileImg");

  const $profileName = document.createElement("div");
  $profileName.classList.add("profileName");
  $profileName.innerHTML = "announcement_bot";

  const $chatStatus = document.createElement("div");
  if (cnt !== 0 && cnt !== undefined && cnt !== null) {
    $chatStatus.classList.add("chatStatus");
    $chatStatus.innerHTML = cnt;
  }

  $profileInfo.appendChild($profileImg);
  $profileInfo.appendChild($profileName);

  $botWrapper.appendChild($profileInfo);
  $botWrapper.appendChild($chatStatus);

  $botWrapper.addEventListener("mouseover", () => {
    $chatStatus.style.display = "none";
  });

  $botWrapper.addEventListener("mouseout", () => {
    $chatStatus.style.display = "inherit";
  });

  $botWrapper.addEventListener("click", () => {
    BotRoom();
  });

  return $botWrapper;
}
