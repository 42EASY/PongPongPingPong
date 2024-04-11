import BotRoom from "../../pages/BotRoom.js";

let botNotifyCount = 0;

export function setBotNotifyCount(newBotNotifyCount) {
  botNotifyCount = newBotNotifyCount;
}

export function getBotNotifyCount() {
  return botNotifyCount;
}

export function incrementBotNotifyCount() {
  botNotifyCount += 1;
}

export default function Bot(BotNotifyCount) {
  setBotNotifyCount(BotNotifyCount);

  const $botWrapper = document.createElement("div");
  $botWrapper.classList.add("chatWrapper", "botChatWrapper");

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
  $chatStatus.classList.add("chatStatus");
  $chatStatus.innerText = getBotNotifyCount();
  $chatStatus.style.display = getBotNotifyCount() > 0 ? "flex" : "none";

  $profileInfo.appendChild($profileImg);
  $profileInfo.appendChild($profileName);

  $botWrapper.appendChild($profileInfo);
  $botWrapper.appendChild($chatStatus);

  $botWrapper.addEventListener("mouseover", () => {
    $chatStatus.style.display = "none";
  });

  $botWrapper.addEventListener("mouseout", () => {
    $chatStatus.style.display = getBotNotifyCount() > 0 ? "flex" : "none";
  });

  $botWrapper.addEventListener("click", () => {
    BotRoom();
  });

  return $botWrapper;
}
