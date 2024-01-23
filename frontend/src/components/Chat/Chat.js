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

  //안읽은 채팅 있을 경우
  const $chatStatus = document.createElement("div");
  $chatStatus.classList.add("chatStatus");
  $chatStatus.innerText = "1";

  //호버 시 닫기 버튼 띄우기
  const $closeButton = document.createElement("i");
  $closeButton.classList.add("closeButton", "bi", "bi-x-lg", "hide");

  $profileInfo.appendChild($profileImg);
  $profileInfo.appendChild($profileName);

  $chatWrapper.appendChild($profileInfo);
  $chatWrapper.appendChild($chatStatus);
  $chatWrapper.appendChild($closeButton);

  $chatWrapper.addEventListener("mouseover", () => {
    $closeButton.classList.remove("hide");
    // $chatStatus.classList.add("hide");
    $chatStatus.style.display = "none";
  });

  $chatWrapper.addEventListener("mouseout", () => {
    $closeButton.classList.add("hide");
    // $chatStatus.classList.remove("hide");
    $chatStatus.style.display = "inherit";
  });

  return $chatWrapper;
}
