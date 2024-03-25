import Modal from "../Modal/Modal.js";
import {
  joinNormalQueue,
  joinTournamentQueue,
  cancelNormalQueue,
} from "./JoinQueue.js";

export function inviteGame(id, status) {
  if (status === "OFFLINE") {
    Modal("inviteFail_offline");
  } else if (status === "IN-GAME") {
    Modal("inviteFail_offline");
  } else if (status === "ONLINE") {
    let game_mode;
    const modal = Modal("gameMode");
    const $2p = document.querySelector(".modalBody").firstChild;
    document.querySelector(".modalBody").removeChild($2p);
    modal.then((result) => {
      if (result.isPositive && result.input === "일반 게임") {
        Modal("gameOption").then((option) => {
          if (option.isPositive) {
            if (option.input === "클래식") game_mode = "CLASSIC";
            else if (option.input === "스피드") game_mode = "SPEED";
            joinNormalQueue({
              action: "invite_normal_queue",
              game_mode: game_mode,
              invite_user_id: id,
            });
            Modal("waitingInvitation").then((res) => {
              // 모달 취소하기 버튼 눌렀을 경우
              if (!res.isPositive) cancelNormalQueue({ action: "" });
            });
          }
        });
      }
      if (result.isPositive && result.input === "토너먼트") {
        joinTournamentQueue({
          action: "invite_tournament_queue",
          invite_user_id: id,
        });
      }
    });
  }
}
