import addModal from "./adddModal.js";

const fstModal = {
  title: "friend1 님과 친구를 끊으시겠습니까?",
  showCloseButton: true,
  bodyContent: [
    { type: "text", text: "이 사용자를 다시 친구 추가할 수 있습니다." },
  ],
  footerContent: [
    {
      type: "secondaryButton",
      text: "취소",
    },
    {
      type: "primaryButton",
      text: "친구끊기",
    },
  ],
};

const sndModal = {
  title: "friend1 님을 차단하시겠습니까?",
  showCloseButton: true,
  bodyContent: [
    { type: "text", text: "Friends > 차단 목록에서 해제할 수 있습니다." },
  ],
  footerContent: [
    {
      type: "secondaryButton",
      text: "취소",
    },
    {
      type: "primaryButton",
      text: "친구끊기",
    },
  ],
};

const $app = document.querySelector(".App");

export default function Modal(modalId) {
  console.log("modal ID:" + modalId);
  let $modalWrapper;
  let $closeButtons;

  if (modalId === 1) $modalWrapper = addModal(fstModal);
  else if (modalId === 2) $modalWrapper = addModal(sndModal);
  $app.appendChild($modalWrapper);

  $closeButtons = document.getElementsByClassName("closeButton");
  for (let i = 0; i < $closeButtons.length; i++) {
    $closeButtons[i].addEventListener("click", () => {
      console.log($closeButtons[i]);
      $app.removeChild($modalWrapper);
    });
  }
}
