import addModal from "./adddModal.js";

const deleteFriend = {
  title: "friend1 님과 친구를 끊으시겠습니까?",
  showCloseButton: true,
  bodyContent: [
    { type: "text", text: "이 사용자를 다시 친구 추가할 수 있습니다." },
  ],
  footerContent: [
    {
      type: "secondaryButton",
      text: "취소",
      class: "btn secondaryButton closeButton",
    },
    {
      type: "primaryButton",
      text: "친구끊기",
      class: "btn primaryButton",
    },
  ],
};

const blockFriend = {
  title: "friend1 님을 차단하시겠습니까?",
  showCloseButton: true,
  bodyContent: [
    { type: "text", text: "Friends > 차단 목록에서 해제할 수 있습니다." },
  ],
  footerContent: [
    {
      type: "secondaryButton",
      text: "취소",
      class: "btn secondaryButton closeButton",
    },
    {
      type: "primaryButton",
      text: "차단하기",
      class: "btn primaryButton",
    },
  ],
};

const unblockFriend = {
  title: "friend1 님을 차단 해제하시겠습니까?",
  showCloseButton: true,
  bodyContent: [
    { type: "text", text: "이제 friend1 님의 메세지를 받을 수 있습니다." },
  ],
  footerContent: [
    {
      type: "secondaryButton",
      text: "취소",
      class: "btn secondaryButton closeButton",
    },
    {
      type: "primaryButton",
      text: "해제하기",
      class: "btn primaryButton",
    },
  ],
};

const exitChatting = {
  title: "채팅방에서 나가시겠습니까?",
  showCloseButton: true,
  bodyContent: [
    { type: "text", text: "friend 님과의 대화 내역이 모두 삭제됩니다." },
  ],
  footerContent: [
    {
      type: "secondaryButton",
      text: "취소",
      class: "btn secondaryButton closeButton",
    },
    {
      type: "primaryButton",
      text: "나가기",
      class: "btn primaryButton",
    },
  ],
};

const gameMode = {
  title: "게임 모드 선택",
  showCloseButton: true,
  bodyContent: [
    {
      type: "radio",
      text: "2P 게임",
      explanation: "하나의 키보드에서 두 명의 플레이어 간 게임이 진행됩니다",
    },
    {
      type: "radio",
      text: "일반 게임",
      explanation: "1:1 방식으로 진행됩니다",
    },
    {
      type: "radio",
      text: "토너먼트",
      explanation: "4명이 모여 토너먼트 방식으로 진행됩니다",
    },
  ],
  footerContent: [
    {
      type: "singleButton",
      text: "다음",
      class: "btn singleButton",
      id: "gameModeNext",
    },
  ],
};

const gameOption = {
  title: "게임 옵션 선택",
  showCloseButton: true,
  bodyContent: [
    {
      type: "radio",
      text: "클래식",
      explanation: "Pong 게임 방식으로 진행됩니다",
    },
    {
      type: "radio",
      text: "스피드",
      explanation: "공의 속도가 더 빠릅니다",
    },
  ],
  footerContent: [
    {
      type: "singleButton",
      text: "게임 시작",
      class: "btn singleButton",
      id: "gameOptionStart",
    },
  ],
};

const waitingPlayer = {
  title: "대전자 찾는 중",
  showCloseButton: true,
  footerContent: [
    {
      type: "singleButton",
      text: "취소",
      class: "btn singleButton closeButton",
    },
  ],
};

const $app = document.querySelector(".App");

export default function Modal(modalName) {
  console.log("modal name :" + modalName);
  let $modalWrapper;
  let $closeButtons;

  if (modalName === "deleteFriend") $modalWrapper = addModal(deleteFriend);
  else if (modalName === "blockFriend") $modalWrapper = addModal(blockFriend);
  else if (modalName === "unblockFriend")
    $modalWrapper = addModal(unblockFriend);
  else if (modalName === "exitChatting") $modalWrapper = addModal(exitChatting);
  else if (modalName === "gameMode") {
    let selectedGameMode = "";
    $modalWrapper = addModal(gameMode);
    const $radioButtons = $modalWrapper.querySelectorAll('input[type="radio"]');
    for (const $radioButton of $radioButtons) {
      $radioButton.addEventListener("change", () => {
        selectedGameMode = $radioButton.value;
      });
    }

    const $nextButton = $modalWrapper.querySelector("#gameModeNext");
    $nextButton.addEventListener("click", () => {
      if (selectedGameMode) {
        $app.removeChild($modalWrapper);
        Modal("gameOption");
      }
    });
  } else if (modalName === "gameOption") {
    let selectedGameOption = "";
    $modalWrapper = addModal(gameOption);
    const $radioButtons = $modalWrapper.querySelectorAll('input[type="radio"]');
    for (const $radioButton of $radioButtons) {
      $radioButton.addEventListener("change", () => {
        selectedGameOption = $radioButton.value;
      });
    }

    const $startButton = $modalWrapper.querySelector("#gameOptionStart");
    console.log("selected game Option : " + selectedGameOption);
    $startButton.addEventListener("click", () => {
      if (selectedGameOption) {
        $app.removeChild($modalWrapper);
        Modal("waitingPlayer");
      }
    });
  } else if (modalName === "waitingPlayer")
    $modalWrapper = addModal(waitingPlayer);

  console.log($modalWrapper);
  $app.appendChild($modalWrapper);

  $closeButtons = document.getElementsByClassName("closeButton");
  for (let i = 0; i < $closeButtons.length; i++) {
    $closeButtons[i].addEventListener("click", () => {
      console.log($closeButtons[i]);
      $app.removeChild($modalWrapper);
    });
  }
}
