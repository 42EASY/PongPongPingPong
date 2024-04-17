import { inviteGame } from "../../Nav/InviteQueue.js";
import {
  postFriend,
  deleteFriend,
  postBlock,
  deleteBlock,
} from "../../Main/UserApi.js";
import Modal from "../../Modal/Modal.js";

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

  //게임신청 버튼 클릭 이벤트
  $requestGameButton.addEventListener("click", () => {
    inviteGame(user.user_id, user.status);
  });

  //친구추가 버튼 클릭 이벤트
  $addFriendButton.addEventListener("click", () => {
    if (user.relation === "FRIEND") {
      //친구 삭제
      Modal("deleteFriend", user.nickname).then((result) => {
        if (result.isPositive) {
          deleteFriend(user.user_id);
          $addFriendButtonIcon.classList.remove("bi-person");
          $addFriendButtonIcon.classList.add("bi-person-plus");
          $addFriendButtonText.innerHTML = "친구추가";
          user.relation = "NONE";
        }
      });
    } else {
      //친구 추가
      postFriend(user.user_id);
      $addFriendButtonIcon.classList.remove("bi-person-plus");
      $addFriendButtonIcon.classList.add("bi-person");
      $addFriendButtonText.innerHTML = "친구";
      user.relation = "FRIEND";
    }
  });

  //차단하기 버튼 클릭 이벤트
  $blockingButton.addEventListener("click", () => {
    if (user.relation === "BLOCK") {
      //차단 해제
      Modal("unblockFriend", user.nickname).then((result) => {
        if (result.isPositive) {
          deleteBlock(user.user_id);
          $blockingButtonText.innerHTML = "차단하기";
          $requestGameButton.style.display = "";
          $addFriendButton.style.display = "";
          user.relation = "NONE";
        }
      });
    } else {
      //차단 하기
      Modal("blockFriend", user.nickname).then((result) => {
        if (result.isPositive) {
          postBlock(user.user_id, user.status);
          $blockingButtonText.innerHTML = "차단해제";
          $requestGameButton.style.display = "none";
          $addFriendButton.style.display = "none";
          user.relation = "BLOCK";
        }
      });
    }
  });

  return $infoButtonWrapper;
}
