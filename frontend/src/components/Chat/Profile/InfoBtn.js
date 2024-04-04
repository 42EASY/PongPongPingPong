export default function InfoBtn(user) {
  const $infoButtonWrapper = document.createElement("div");
  $infoButtonWrapper.classList.add("infoButtonWrapper");

  const $requestGameButton = document.createElement("div");
  $requestGameButton.classList.add("requestGameButton", "infoButton");
  const $requestGameButtonIcon = document.createElement("i");
  $requestGameButtonIcon.classList.add("bi", "bi-rocket-takeoff");
  const $requestGameButtonText = document.createElement("div");
  $requestGameButtonText.classList.add("requestGameButtonText");
  $requestGameButtonText.innerHTML = "게임신청";
  //todo: 게임신청 버튼 클릭 시 게임신청 모달 띄우기

  const $addFriendButton = document.createElement("div");
  $addFriendButton.classList.add("addFriendButton", "infoButton");
  const $addFriendButtonIcon = document.createElement("i");
  $addFriendButtonIcon.classList.add("bi", "bi-person-plus");
  const $addFriendButtonText = document.createElement("div");
  $addFriendButtonText.classList.add("addFriendButtonText");
  $addFriendButtonText.innerHTML = "친구추가";
  //todo: 친구추가 버튼 클릭 시 친구하기

  const $blockingButton = document.createElement("div");
  $blockingButton.classList.add("blockingButton", "infoButton");
  const $blockingButtonIcon = document.createElement("i");
  $blockingButtonIcon.classList.add("bi", "bi-person-slash");
  const $blockingButtonText = document.createElement("div");
  $blockingButtonText.classList.add("blockingButtonText");
  $blockingButtonText.innerHTML = "차단하기";
  //todo: 차단하기 버튼 클릭 시 차단하기

  $requestGameButton.appendChild($requestGameButtonIcon);
  $requestGameButton.appendChild($requestGameButtonText);
  $addFriendButton.appendChild($addFriendButtonIcon);
  $addFriendButton.appendChild($addFriendButtonText);
  $blockingButton.appendChild($blockingButtonIcon);
  $blockingButton.appendChild($blockingButtonText);

  console.log(user.relation === "NONE");
  if (user.relation === "NONE") {
    $infoButtonWrapper.appendChild($requestGameButton);
    $infoButtonWrapper.appendChild($addFriendButton);
    $infoButtonWrapper.appendChild($blockingButton);
  }
  if (user.relation === "BLOCK") {
    $blockingButtonText.innerHTML = "차단해제";
    $infoButtonWrapper.appendChild($blockingButton);
  }
  if (user.relation === "FRIEND") {
    $addFriendButtonIcon.classList.remove("bi-person-plus");
    $addFriendButtonIcon.classList.add("bi-person");
    $addFriendButtonText.innerHTML = "친구";
    $infoButtonWrapper.appendChild($requestGameButton);
    $infoButtonWrapper.appendChild($addFriendButton);
    $infoButtonWrapper.appendChild($blockingButton);
  }

  return $infoButtonWrapper;
}
