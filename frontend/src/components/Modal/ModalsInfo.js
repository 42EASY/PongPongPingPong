const onlyYes = {
  title: "title",
  bodyContent: [
    {
      type: "text",
      text: "",
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

const yesOrNo = {
  title: "title",
  bodyContent: [
    {
      type: "text",
      text: "body text",
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
      text: "확인",
      class: "btn primaryButton close positive",
    },
  ],
};

const inviteFail = JSON.parse(JSON.stringify(onlyYes));
inviteFail.title = "사용자를 초대할 수 없습니다";

const modals = {
  tfa: {
    title: "2차 인증 설정",
    bodyContent: [
      {
        type: "image",
        src: "./src/images/qr.png",
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
  },

  otp: {
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
  },

  gameMode: {
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
  },

  gameOption: {
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
  },

  waitingPlayer: {
    title: "대전자 찾는 중",
    hideCloseButton: true,
    backdropCloseDisabled: true,
    footerContent: [
      {
        type: "singleButton",
        text: "취소",
        class: "btn singleButton close",
      },
    ],
  },

  waitingInvitation: {
    title: "초대 수락 대기 중",
    hideCloseButton: true,
    backdropCloseDisabled: true,
    footerContent: [
      {
        type: "singleButton",
        text: "취소",
        class: "btn singleButton close",
      },
    ],
  },

  tournamentTable: {
    title: "토너먼트 대진표",
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
    bodyContent: [
      {
        type: "image",
        src: "./src/images/League_table.png",
        alt: "league_table",
      },
    ],
  },

  gameLeftServe: {
    title: "공 이동 방향",
    hideCloseButton: true,
    backdropCloseDisabled: true,
    bodyContent: [{ type: "i", class: "bi bi-arrow-left" }],
  },

  gameRightServe: {
    title: "공 이동 방향",
    hideCloseButton: true,
    backdropCloseDisabled: true,
    bodyContent: [{ type: "i", class: "bi bi-arrow-right" }],
  },

  // yes or no
  deleteFriend: JSON.parse(JSON.stringify(yesOrNo)),
  blockFriend: JSON.parse(JSON.stringify(yesOrNo)),
  unblockFriend: JSON.parse(JSON.stringify(yesOrNo)),
  exitChatting: JSON.parse(JSON.stringify(yesOrNo)),

  // only yes
  invalidGame: JSON.parse(JSON.stringify(onlyYes)),
  tfaSuccess: JSON.parse(JSON.stringify(onlyYes)),
  tfaFail: JSON.parse(JSON.stringify(onlyYes)),
  matchingFail: JSON.parse(JSON.stringify(onlyYes)),
  inviteFail_alreadyInvited: JSON.parse(JSON.stringify(inviteFail)),
  inviteFail_fullRoom: JSON.parse(JSON.stringify(inviteFail)),
  inviteFail_offline: JSON.parse(JSON.stringify(inviteFail)),
  inviteFail_inGame: JSON.parse(JSON.stringify(inviteFail)),
};

// yes or no
modals.deleteFriend.title = "friend1 님과 친구를 끊으시겠습니까?";
modals.deleteFriend.bodyContent[0].text =
  "이 사용자를 다시 친구 추가할 수 있습니다";
modals.deleteFriend.footerContent[1].text = "친구끊기";

modals.blockFriend.title = "friend1 님을 차단하시겠습니까?";
modals.blockFriend.bodyContent[0].text =
  "Friends > 차단 목록에서 해제할 수 있습니다.";
modals.blockFriend.footerContent[1].text = "차단하기";

modals.unblockFriend.title = "friend1 님을 차단 해제하시겠습니까?";
modals.unblockFriend.bodyContent[0].text =
  "이제 friend1 님의 메세지를 받을 수 있습니다.";
modals.unblockFriend.footerContent[1].text = "해제하기";

modals.exitChatting.title = "채팅방에서 나가시겠습니까?";
modals.exitChatting.bodyContent[0].text =
  "friend 님과의 대화 내역이 모두 삭제됩니다.";
modals.exitChatting.footerContent[1].text = "나가기";

// only Yes
modals.invalidGame.title = "게임을 찾을 수 없습니다";
modals.invalidGame.bodyContent[0].text =
  "이미 만료되었거나, 유효하지 않은 게임입니다";

modals.tfaSuccess.title = "2차인증에 성공했습니다";

modals.tfaFail.title = "2차인증에 실패했습니다";
modals.tfaFail.bodyContent[0].text = "다시 시도해 주세요";

modals.matchingFail.title = "대전자를 찾을 수 없습니다";

modals.inviteFail_alreadyInvited.bodyContent[0].text =
  "이미 초대되었거나 초대 대기 중인 사용자는 초대할 수 없습니다";

modals.inviteFail_fullRoom.bodyContent[0].text =
  "게임방이 꽉 차면 더이상 사용자를 초대할 수 없습니다";

modals.inviteFail_offline.bodyContent[0].text =
  "오프라인 상태의 사용자는 초대할 수 없습니다";

modals.inviteFail_inGame.bodyContent[0].text =
  "게임 중인 상태의 사용자는 초대할 수 없습니다";

export default modals;
