import addModal from "./adddModal.js";
import modals from "./ModalsInfo.js";

const $app = document.querySelector(".App");

export default function Modal(modalName) {
  console.log("modal name :" + modalName);
  let $modalWrapper;
  let $closeButtons;

  if (modalName === "tfa") $modalWrapper = addModal(modals.tfa);
  else if (modalName === "otp") $modalWrapper = addModal(modals.otp);
  else if (modalName === "deleteFriend")
    $modalWrapper = addModal(modals.deleteFriend);
  else if (modalName === "blockFriend")
    $modalWrapper = addModal(modals.blockFriend);
  else if (modalName === "unblockFriend")
    $modalWrapper = addModal(modals.unblockFriend);
  else if (modalName === "exitChatting")
    $modalWrapper = addModal(modals.exitChatting);
  else if (modalName === "invalidGame")
    $modalWrapper = addModal(modals.invalidGame);
  else if (modalName === "tournamentTable")
    $modalWrapper = addModal(modals.tournamentTable);
  else if (modalName === "gameResultTable")
    $modalWrapper = addModal(modals.gameResultTable);
  else if (modalName === "tfaSuccess")
    $modalWrapper = addModal(modals.tfaSuccess);
  else if (modalName === "tfaFail") $modalWrapper = addModal(modals.tfaFail);
  else if (modalName === "inviteFail_alreadyInvited")
    $modalWrapper = addModal(modals.inviteFail_alreadyInvited);
  else if (modalName === "inviteFail_fullRoom")
    $modalWrapper = addModal(modals.inviteFail_fullRoom);
  else if (modalName === "inviteFail_offline")
    $modalWrapper = addModal(modals.inviteFail_offline);
  else if (modalName === "inviteFail_inGame")
    $modalWrapper = addModal(modals.inviteFail_inGame);
  else if (modalName === "gameMode") {
    let selectedGameMode = "";
    $modalWrapper = addModal(modals.gameMode);
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
    $modalWrapper = addModal(modals.gameOption);
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
  } else if (modalName === "waitingPlayer")
    $modalWrapper = addModal(modals.waitingPlayer);

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
}
