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
    Modal("inviteFail_inGame");
  } else if (status === "ONLINE") {
    let game_option;
    const modal = Modal("gameMode");
    const $2p = document.querySelector(".modalBody").firstChild;
    document.querySelector(".modalBody").removeChild($2p);
    modal.then((result) => {
      if (result.isPositive && result.input === "일반 게임") {
        Modal("gameOption").then((option) => {
          if (option.isPositive) {
            if (option.input === "클래식") game_option = "CLASSIC";
            else if (option.input === "스피드") game_option = "SPEED";
            joinNormalQueue({
              action: "invite_normal_queue",
              game_mode: game_option,
              invite_user_id: id,
            });
            Modal("waitingInvitation").then((res) => {
              if (!res.isPositive)
                cancelNormalQueue({ action: "cancel_queue" });
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
