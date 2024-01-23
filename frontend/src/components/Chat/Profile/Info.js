import ContactInfo from "./ContactInfo.js";

export default function Info() {
  const $infoWrapper = document.createElement("div");
  $infoWrapper.classList.add("infoWrapper");

  const $infoProfileImg = document.createElement("img");
  $infoProfileImg.setAttribute("src", "../../images/none_profile.png");
  $infoProfileImg.setAttribute("alt", "profileImg");
  $infoProfileImg.classList.add("infoProfileImg");

  const $infoHeader = document.createElement("div");
  $infoHeader.classList.add("infoHeader");

  const $infoNameWrapper = document.createElement("div");
  $infoNameWrapper.classList.add("infoNameWrapper");
  const $infoName = document.createElement("div");
  $infoName.classList.add("infoName");
  $infoName.innerHTML = "hahlee";
  const $profileButton = document.createElement("div");
  $profileButton.classList.add("profileButton", "infoButton");
  const $profileButtonIcon = document.createElement("i");
  $profileButtonIcon.classList.add("bi", "bi-pencil-square");
  const $profileButtonText = document.createElement("div");
  $profileButtonText.classList.add("profileButtonText");
  $profileButtonText.innerHTML = "상세 프로필 보기";
  $profileButton.appendChild($profileButtonIcon);
  $profileButton.appendChild($profileButtonText);
  $infoNameWrapper.appendChild($infoName);
  $infoNameWrapper.appendChild($profileButton);

  const $infoStatusWrapper = document.createElement("div");
  $infoStatusWrapper.classList.add("infoStatusWrapper");
  const $infoStatus = document.createElement("div");
  $infoStatus.classList.add("friendStatus");
  const $infoStatusText = document.createElement("div");
  $infoStatusText.classList.add("infoStatusText");
  $infoStatusText.innerHTML = "온라인";
  $infoStatusWrapper.appendChild($infoStatus);
  $infoStatusWrapper.appendChild($infoStatusText);

  const $infoButtonWrapper = document.createElement("div");
  $infoButtonWrapper.classList.add("infoButtonWrapper");

  const $requestGameButton = document.createElement("div");
  $requestGameButton.classList.add("requestGameButton", "infoButton");
  const $requestGameButtonIcon = document.createElement("i");
  $requestGameButtonIcon.classList.add("bi", "bi-rocket-takeoff");
  const $requestGameButtonText = document.createElement("div");
  $requestGameButtonText.classList.add("requestGameButtonText");
  $requestGameButtonText.innerHTML = "게임신청";

  const $addFriendButton = document.createElement("div");
  $addFriendButton.classList.add("addFriendButton", "infoButton");
  const $addFriendButtonIcon = document.createElement("i");
  $addFriendButtonIcon.classList.add("bi", "bi-person-plus");
  const $addFriendButtonText = document.createElement("div");
  $addFriendButtonText.classList.add("addFriendButtonText");
  $addFriendButtonText.innerHTML = "친구추가";

  const $blockingButton = document.createElement("div");
  $blockingButton.classList.add("blockingButton", "infoButton");
  const $blockingButtonIcon = document.createElement("i");
  $blockingButtonIcon.classList.add("bi", "bi-person-slash");
  const $blockingButtonText = document.createElement("div");
  $blockingButtonText.classList.add("blockingButtonText");
  $blockingButtonText.innerHTML = "차단하기";

  $requestGameButton.appendChild($requestGameButtonIcon);
  $requestGameButton.appendChild($requestGameButtonText);
  $addFriendButton.appendChild($addFriendButtonIcon);
  $addFriendButton.appendChild($addFriendButtonText);
  $blockingButton.appendChild($blockingButtonIcon);
  $blockingButton.appendChild($blockingButtonText);
  $infoButtonWrapper.appendChild($requestGameButton);
  $infoButtonWrapper.appendChild($addFriendButton);
  $infoButtonWrapper.appendChild($blockingButton);

  $infoHeader.appendChild($infoNameWrapper);
  $infoHeader.appendChild($infoStatusWrapper);
  $infoHeader.appendChild($infoButtonWrapper);

  $infoWrapper.appendChild($infoProfileImg);
  $infoWrapper.appendChild($infoHeader);

  const $contactInfo = ContactInfo();
  $infoWrapper.appendChild($contactInfo);

  return $infoWrapper;
}
