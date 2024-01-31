const inviteFail = {
  title: "사용자를 초대할 수 없습니다",
  showCloseButton: true,
  bodyContent: [
    {
      type: "text",
      text: "사용자를 초대할 수 없습니다",
    },
  ],
  footerContent: [
    {
      type: "primaryButton",
      text: "확인",
      class: "btn primaryButton close",
    },
  ],
};

const modals = {
  tfa: {
    title: "2차 인증",
    showCloseButton: true,
    bodyContent: [
      { type: "image", src: "./src/images/qr.png", alt: "qr code" },
    ],
    footerContent: [
      {
        type: "singleButton",
        text: "등록 완료",
        class: "btn singleButton close",
      },
    ],
  },

  deleteFriend: {
    title: "friend1 님과 친구를 끊으시겠습니까?",
    showCloseButton: true,
    bodyContent: [
      { type: "text", text: "이 사용자를 다시 친구 추가할 수 있습니다." },
    ],
    footerContent: [
      {
        type: "secondaryButton",
        text: "취소",
        class: "btn secondaryButton close",
      },
      {
        type: "primaryButton",
        text: "친구끊기",
        class: "btn primaryButton",
      },
    ],
  },

  blockFriend: {
    title: "friend1 님을 차단하시겠습니까?",
    showCloseButton: true,
    bodyContent: [
      { type: "text", text: "Friends > 차단 목록에서 해제할 수 있습니다." },
    ],
    footerContent: [
      {
        type: "secondaryButton",
        text: "취소",
        class: "btn secondaryButton close",
      },
      {
        type: "primaryButton",
        text: "차단하기",
        class: "btn primaryButton",
      },
    ],
  },

  unblockFriend: {
    title: "friend1 님을 차단 해제하시겠습니까?",
    showCloseButton: true,
    bodyContent: [
      { type: "text", text: "이제 friend1 님의 메세지를 받을 수 있습니다." },
    ],
    footerContent: [
      {
        type: "secondaryButton",
        text: "취소",
        class: "btn secondaryButton close",
      },
      {
        type: "primaryButton",
        text: "해제하기",
        class: "btn primaryButton",
      },
    ],
  },

  exitChatting: {
    title: "채팅방에서 나가시겠습니까?",
    showCloseButton: true,
    bodyContent: [
      { type: "text", text: "friend 님과의 대화 내역이 모두 삭제됩니다." },
    ],
    footerContent: [
      {
        type: "secondaryButton",
        text: "취소",
        class: "btn secondaryButton close",
      },
      {
        type: "primaryButton",
        text: "나가기",
        class: "btn primaryButton",
      },
    ],
  },

  gameMode: {
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
  },

  gameOption: {
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
        text: "🏓게임 시작🏓",
        class: "btn singleButton",
        id: "gameStart",
      },
    ],
  },

  waitingPlayer: {
    title: "대전자 찾는 중",
    showCloseButton: true,
    footerContent: [
      {
        type: "singleButton",
        text: "취소",
        class: "btn singleButton close",
      },
    ],
  },

  invalidGame: {
    title: "유효하지 않은 게임입니다",
    showCloseButton: true,
    bodyContent: [
      {
        type: "text",
        text: "이미 만료되었거나, 유효하지 않은 게임입니다",
      },
    ],
    footerContent: [
      {
        type: "primaryButton",
        text: "확인",
        class: "btn primaryButton close",
      },
    ],
  },

  tournamentTable: {
    title: "토너먼트 대진표",
    showCloseButton: true,
    bodyContent: [
      {
        type: "image",
        src: "./src/images/League_table.png",
        alt: "league_table",
      },
    ],
  },

  gameResultTable: {
    title: "게임 종료되었습니다",
    showCloseButton: true,
    bodyContent: [
      {
        type: "image",
        src: "./src/images/League_table.png",
        alt: "league_table",
      },
    ],
  },

  inviteFail_alreadyInvited: JSON.parse(JSON.stringify(inviteFail)),
  inviteFail_fullRoom: JSON.parse(JSON.stringify(inviteFail)),
  inviteFail_offline: JSON.parse(JSON.stringify(inviteFail)),
  inviteFail_inGame: JSON.parse(JSON.stringify(inviteFail)),
};

modals.inviteFail_alreadyInvited.bodyContent[0].text =
  "이미 초대되었거나 초대 대기 중인 사용자는 초대할 수 없습니다";

modals.inviteFail_fullRoom.bodyContent[0].text =
  "게임방이 꽉 차면 더이상 사용자를 초대할 수 없습니다";

modals.inviteFail_offline.bodyContent[0].text =
  "오프라인 상태의 사용자는 초대할 수 없습니다";

modals.inviteFail_inGame.bodyContent[0].text =
  "게임 중인 상태의 사용자는 초대할 수 없습니다";

export default modals;
