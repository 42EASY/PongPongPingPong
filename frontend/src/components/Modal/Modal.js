import { startCount } from "../GameRoom/TimerRing.js";
import addModal from "./adddModal.js";
import getModalContent from "./ModalsInfo.js";

const $app = document.querySelector(".App");

export default function Modal(modalName, argu) {
  console.log(`modal name: ${modalName}, argu: ${argu}`);
  return new Promise((resolve) => {
    const modalContent = getModalContent(modalName, argu);
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

    // gameServe modal 자동 닫힘 예외처리
    if (modalName === "gameLeftServe" || modalName === "gameRightServe") {
      let sec = 3;
      setTimeout(() => {
        if ($modalWrapper && $modalWrapper.parentNode)
          $app.removeChild($modalWrapper);
        resolve(true);
      }, sec * 1000);
    }
    if (modalName === "waitingInvitation") {
      let sec = 60;
      startCount($modalWrapper, sec);
      setTimeout(() => {
        $app.removeChild($modalWrapper);
        resolve(true);
      }, sec * 1000);
    }
    // radio button 텍스트 눌러도 체크 + gameMode의 버튼 text내용 변경
    const $labels = $modalWrapper.querySelectorAll(".modalBody label");
    for (const $label of $labels) {
      $label.addEventListener("click", function () {
        const $radioInput = $label.querySelector('input[type="radio"]');
        if ($radioInput) {
          $radioInput.checked = true;
          if (modalName === "gameMode" && $radioInput.value === "토너먼트") {
            document.querySelector(".singleButton").innerHTML = "🏓게임 시작🏓";
          } else if (modalName === "gameMode") {
            document.querySelector(".singleButton").innerHTML = "다음";
          }
        }
      });
    }
  });

  // input값 가져오기
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

// [v] todo: waitingPlayer, waitingInvitation 예외처리
// [v] tood: ㄴ css 수정
// [v] todo: serve timer 추가
// [v] todo: ㄴ css 수정
