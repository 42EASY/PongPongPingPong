import Modal from "../Modal/Modal.js";
import changeUrl from "../../Router.js";
import {
  joinNormalQueue,
  joinTournamentQueue,
  cancelNormalQueue,
} from "./JoinQueue.js";

export default function FastGameStart() {
  let game_option;
  Modal("gameMode").then((result) => {
    if (result.isPositive && result.input === "2P 게임") {
      Modal("gameOption").then((option) => {
        if (option.isPositive) {
          if (option.input === "클래식") game_option = "CLASSIC";
          else if (option.input === "스피드") game_option = "SPEED";
          changeUrl("/game", {
            mode: "2p",
            option: game_option,
          });
        }
      });
    }
    if (result.isPositive && result.input === "일반 게임") {
      Modal("gameOption").then((option) => {
        if (option.isPositive) {
          if (option.input === "클래식") game_option = "CLASSIC";
          else if (option.input === "스피드") game_option = "SPEED";
          joinNormalQueue({
            action: "join_normal_queue",
            game_mode: game_option,
          });
          Modal("waitingPlayer").then((res) => {
            if (!res.isPositive) cancelNormalQueue({ action: "cancel_queue" });
          });
        }
      });
    }
    if (result.isPositive && result.input === "토너먼트") {
      joinTournamentQueue({ action: "join_tournament_queue" });
    }
  });
}
