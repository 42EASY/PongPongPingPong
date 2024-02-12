import addModal from "./adddModal.js";
import modals from "./ModalsInfo.js";

const $app = document.querySelector(".App");

export default function Modal(modalName) {
  console.log("modal name :" + modalName);

  return new Promise((resolve) => {
    const modalContent = modals[modalName];
    if (!modalContent) console.log(`Error!!!!!!! ${modalName} : not found`); //
    const $modalWrapper = addModal(modalContent);
    $app.appendChild($modalWrapper);
    document
      .querySelector(".modalWrapper")
      .addEventListener("click", (event) => {
        event.stopPropagation();
      });

    // [모달 창 닫는 부분]
    const $closeButtons = document.getElementsByClassName("close");
    for (let i = 0; i < $closeButtons.length; i++) {
      $closeButtons[i].addEventListener("click", (event) => {
        const isPositive = event.target.classList.contains("positive");
        const inputTag = document.querySelector(".modalOverlay input") !== null;
        const input = getInputValue(modalName);
        if (inputTag && isPositive && !input) return;

        $app.removeChild($modalWrapper);
        return inputTag
          ? resolve({ isPositive, input })
          : resolve({ isPositive });
      });
    }

    // gameMode modal 버튼 이름 변경 listener
    if (modalName === "gameMode") {
      const $radioButtons =
        $modalWrapper.querySelectorAll('input[name="game"]');
      for (const $radioButton of $radioButtons) {
        $radioButton.addEventListener("change", () => {
          if ($radioButton.value === "토너먼트")
            document.querySelector(".singleButton").innerHTML = "🏓게임 시작🏓";
          else document.querySelector(".singleButton").innerHTML = "다음";
        });
      }
    }
    // gameServe modal 자동 닫힘 예외처리
    if (modalName === "gameLeftServe" || modalName === "gameRightServe") {
      setTimeout(() => {
        $app.removeChild($modalWrapper);
        resolve(true);
      }, 3000);
    }
  });

  function getInputValue(modalName) {
    if (modalName === "otp") {
      const otpInput = document.querySelector('input[name="otp"]');
      return otpInput.value !== "" ? otpInput.value : false;
    } else if (modalName === "gameMode" || modalName === "gameOption") {
      const checkedRadio = document.querySelector('input[name="game"]:checked');
      return checkedRadio ? checkedRadio.value : false;
    }
    return false;
  }
}
