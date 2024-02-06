import addModal from "./adddModal.js";
import modals from "./ModalsInfo.js";

const $app = document.querySelector(".App");

export default function Modal(modalName) {
  console.log("modal name :" + modalName);
  let $modalWrapper;
  let $closeButtons;

  const modalContent = modals[modalName];
  if (modalContent) $modalWrapper = addModal(modalContent);
  else {
    console.log("`${modalName}` not found");
    return;
  }

  $app.appendChild($modalWrapper);

  $closeButtons = document.getElementsByClassName("close");
  for (let i = 0; i < $closeButtons.length; i++) {
    $closeButtons[i].addEventListener("click", () => {
      $app.removeChild($modalWrapper);
    });
  }

  document.querySelector(".modalWrapper").addEventListener("click", (event) => {
    event.stopPropagation();
  });

  //gameMode modal 예외처리
  if (modalName === "gameMode") {
    let selectedGameMode = "";
    const $radioButtons = $modalWrapper.querySelectorAll('input[type="radio"]');
    for (const $radioButton of $radioButtons) {
      $radioButton.addEventListener("change", () => {
        selectedGameMode = $radioButton.value;
        if ($radioButton.value === "토너먼트") {
          const $button = document.querySelector(".singleButton");
          $button.innerHTML = "🏓게임 시작🏓";
          $button.setAttribute("id", "gameStart");
        } else {
          const $button = document.querySelector(".singleButton");
          $button.innerHTML = "다음";
          $button.setAttribute("id", "gameModeNext");
        }
      });
    }

    const $nextButton = $modalWrapper.querySelector("#gameModeNext");
    $nextButton.addEventListener("click", () => {
      if (selectedGameMode === "토너먼트") {
        $app.removeChild($modalWrapper);
        Modal("waitingPlayer");
      } else if (selectedGameMode) {
        $app.removeChild($modalWrapper);
        Modal("gameOption");
      }
    });
  } else if (modalName === "gameOption") {
    let selectedGameOption = "";
    const $radioButtons = $modalWrapper.querySelectorAll('input[type="radio"]');
    for (const $radioButton of $radioButtons) {
      $radioButton.addEventListener("change", () => {
        selectedGameOption = $radioButton.value;
      });
    }

    const $startButton = $modalWrapper.querySelector("#gameStart");
    $startButton.addEventListener("click", () => {
      if (selectedGameOption) {
        $app.removeChild($modalWrapper);
        Modal("waitingPlayer");
      }
    });
  }
}
