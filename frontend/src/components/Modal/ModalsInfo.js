import TimerRing from "../GameRoom/TimerRing.js";
import TournamentTable from "./TournamentTable.js";
import GameResultTable from "./GameResultTable.js";

export function TimerBar() {
  const $timerBar = document.createElement("div");
  $timerBar.classList.add("timerBar");
  return $timerBar;
}

function getOnlyYesModal(titleText, bodyText) {
  return {
    title: titleText,
    bodyContent: [
      {
        type: "text",
        text: bodyText,
      },
    ],
    footerContent: [
      {
        type: "primaryButton",
        text: "확인",
        class: "btn primaryButton close positive",
      },
    ],
  };
}

function getYesOrNoModal(titleText, bodyText, yesButtonText) {
  return {
    title: titleText,
    bodyContent: [
      {
        type: "text",
        text: bodyText,
      },
    ],
    footerContent: [
      {
        type: "secondaryButton",
        text: "취소",
        class: "btn secondaryButton close",
      },
      {
        type: "primaryButton",
        text: yesButtonText,
        class: "btn primaryButton close positive",
      },
    ],
  };
}
//------------------------------
function get_otp(argu) {
  return {
    title: "2차 인증 설정",
    bodyContent: [
      {
        type: "image",
        src: argu,
        alt: "qr code",
      },
      {
        type: "text",
        text: "Google OTP(Autheticator) 앱에서 QR코드를 스캔해주세요",
      },
    ],
    footerContent: [
      {
        type: "singleButton",
        text: "확인",
        class: "btn singleButton close positive",
      },
    ],
  };
}
function get_tfa() {
  return {
    title: "OTP 인증번호 입력",
    bodyContent: [
      {
        type: "text",
        text: "Google OTP(Autheticator) 앱의\n인증번호 6자리를 입력해주세요",
      },
      {
        type: "input",
        name: "otp",
        placeHolder: "인증번호를 입력하세요",
      },
    ],
    footerContent: [
      {
        type: "singleButton",
        text: "확인",
        class: "btn singleButton close otpSummit positive",
      },
    ],
  };
}
function get_gameMode() {
  return {
    title: "게임 모드 선택",
    bodyContent: [
      {
        type: "radio",
        text: "2P 게임",
        name: "game",
        explanation: "하나의 키보드에서 두 명의 플레이어 간 게임이 진행됩니다",
      },
      {
        type: "radio",
        text: "일반 게임",
        name: "game",
        explanation: "1:1 방식으로 진행됩니다",
      },
      {
        type: "radio",
        text: "토너먼트",
        name: "game",
        explanation: "4명이 모여 토너먼트 방식으로 진행됩니다",
      },
    ],
    footerContent: [
      {
        type: "singleButton",
        text: "다음",
        class: "btn singleButton positive close",
      },
    ],
  };
}
function get_gameOption() {
  return {
    title: "게임 옵션 선택",
    bodyContent: [
      {
        type: "radio",
        text: "클래식",
        name: "game",
        explanation: "Pong 게임 방식으로 진행됩니다",
      },
      {
        type: "radio",
        text: "스피드",
        name: "game",
        explanation: "공의 속도가 더 빠릅니다",
      },
    ],
    footerContent: [
      {
        type: "singleButton",
        text: "🏓게임 시작🏓",
        class: "btn singleButton positive close",
      },
    ],
  };
}
function get_waitingPlayer() {
  return {
    title: "대전자 찾는 중 . . .",
    hideCloseButton: true,
    backdropCloseDisabled: true,
    bodyContent: [TimerRing()],
    footerContent: [
      {
        type: "singleButton",
        text: "취소",
        class: "btn singleButton close",
      },
    ],
  };
}
function get_waitingInvitation() {
  return {
    title: "초대 수락 대기 중 . . .",
    hideCloseButton: true,
    backdropCloseDisabled: true,
    bodyContent: [TimerRing()],
    footerContent: [
      {
        type: "singleButton",
        text: "취소",
        class: "btn singleButton close",
      },
    ],
  };
}
function get_tournamentTable(argu) {
  return {
    title: "토너먼트 대진표",
    bodyContent: [TournamentTable(argu.players)],
  };
}
function get_gameResultTable(argu) {
  return {
    title: "게임 종료되었습니다",
    bodyContent: [GameResultTable(argu)],
  };
}
function get_gameStartSoon(argu) {
  return {
    title: "게임이 곧 시작됩니다",
    hideCloseButton: true,
    backdropCloseDisabled: true,
    bodyContent: [TournamentTable(argu.players)],
    footerContent: [TimerBar()],
  };
}
function get_gameLeftServe() {
  return {
    title: "공 이동 방향",
    hideCloseButton: true,
    backdropCloseDisabled: true,
    bodyContent: [{ type: "i", class: "bi bi-arrow-left" }],
    footerContent: [TimerBar()],
  };
}
function get_gameRightServe() {
  return {
    title: "공 이동 방향",
    hideCloseButton: true,
    backdropCloseDisabled: true,
    bodyContent: [{ type: "i", class: "bi bi-arrow-right" }],
    footerContent: [TimerBar()],
  };
}

function get_deleteFriend(argu) {
  return getYesOrNoModal(
    `${argu} 님과 친구를 끊으시겠습니까?`,
    "이 사용자를 다시 친구 추가할 수 있습니다",
    "친구끊기"
  );
}
function get_blockFriend(argu) {
  return getYesOrNoModal(
    `${argu} 님을 차단하시겠습니까?`,
    "Friends > 차단 목록에서 해제할 수 있습니다.",
    "차단하기"
  );
}
function get_unblockFriend(argu) {
  return getYesOrNoModal(
    `${argu} 님을 차단 해제하시겠습니까?`,
    `이제 ${argu} 님의 메세지를 받을 수 있습니다.`,
    "해제하기"
  );
}
function get_exitChatting(argu) {
  return getYesOrNoModal(
    "채팅방에서 나가시겠습니까?",
    `${argu} 님과의 대화 내역이 모두 삭제됩니다.`,
    "나가기"
  );
}
function get_invalidGame() {
  return getOnlyYesModal(
    "게임을 찾을 수 없습니다",
    "이미 만료되었거나, 유효하지 않은 게임입니다"
  );
}
function get_tfaSuccess() {
  return getOnlyYesModal("2차인증에 성공했습니다", "");
}
function get_tfaFail() {
  return getOnlyYesModal("2차인증에 실패했습니다", "다시 시도해 주세요");
}
function get_matchingFail() {
  return getOnlyYesModal("대전자를 찾을 수 없습니다", "");
}
function get_inviteFail_alreadyInvited() {
  return getOnlyYesModal(
    "사용자를 초대할 수 없습니다",
    "이미 초대되었거나 초대 대기 중인 사용자는 초대할 수 없습니다"
  );
}
function get_inviteFail_fullRoom() {
  return getOnlyYesModal(
    "사용자를 초대할 수 없습니다",
    "게임방이 꽉 차면 더이상 사용자를 초대할 수 없습니다"
  );
}
function get_inviteFail_offline() {
  return getOnlyYesModal(
    "사용자를 초대할 수 없습니다",
    "오프라인 상태의 사용자는 초대할 수 없습니다"
  );
}
function get_inviteFail_inGame() {
  return getOnlyYesModal(
    "사용자를 초대할 수 없습니다",
    "게임 중인 상태의 사용자는 초대할 수 없습니다"
  );
}
function get_enterFail_fullRoom() {
  return getOnlyYesModal(
    "게임방에 참여할 수 없습니다",
    "게임방이 꽉 차면 더이상 참여할 수 없습니다"
  );
}
function get_chatFail_offline() {
  return getOnlyYesModal(
    "채팅을 보낼 수 없습니다",
    "오프라인 상태의 사용자에게 채팅을 보낼 수 없습니다"
  );
}
function get_chatFail_blockedUser() {
  return getOnlyYesModal(
    "채팅을 보낼 수 없습니다",
    "차단한 사용자에게 채팅을 보낼 수 없습니다"
  );
}

//==============================================
export default function getModalContent(modalName, argu) {
  switch (modalName) {
    case "otp":
      return get_otp(argu);
    case "tfa":
      return get_tfa(argu);
    case "gameMode":
      return get_gameMode();
    case "gameOption":
      return get_gameOption();
    case "waitingPlayer":
      return get_waitingPlayer();
    case "waitingInvitation":
      return get_waitingInvitation();
    case "tournamentTable":
      return get_tournamentTable(argu);
    case "gameResultTable":
      return get_gameResultTable(argu);
    case "gameStartSoon":
      return get_gameStartSoon(argu);
    case "gameLeftServe":
      return get_gameLeftServe();
    case "gameRightServe":
      return get_gameRightServe();
    case "deleteFriend":
      return get_deleteFriend(argu);
    case "blockFriend":
      return get_blockFriend(argu);
    case "unblockFriend":
      return get_unblockFriend(argu);
    case "exitChatting":
      return get_exitChatting(argu);
    case "invalidGame":
      return get_invalidGame();
    case "tfaSuccess":
      return get_tfaSuccess(); // undefined
    case "tfaFail":
      return get_tfaFail();
    case "matchingFail": // undefined
      return get_matchingFail();
    case "inviteFail_alreadyInvited":
      return get_inviteFail_alreadyInvited();
    case "inviteFail_fullRoom":
      return get_inviteFail_fullRoom();
    case "inviteFail_offline":
      return get_inviteFail_offline();
    case "inviteFail_inGame":
      return get_inviteFail_inGame();
    case "enterFaill_fullRoom":
      return get_enterFail_fullRoom();
    case "chatFail_offline":
      return get_chatFail_offline();
    case "chatFail_blockedUser":
      return get_chatFail_blockedUser();
  }
}
