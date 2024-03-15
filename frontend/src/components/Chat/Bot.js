export default function Bot() {
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

  $profileInfo.appendChild($profileImg);
  $profileInfo.appendChild($profileName);
  $botWrapper.appendChild($profileInfo);

  $botWrapper.addEventListener("dbclick", () => {});

  return $botWrapper;
}
