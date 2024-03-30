import Modal from "../Modal/Modal.js";
import changeUrl from "../../Router.js";
import {
  joinNormalQueue,
  joinTournamentQueue,
  cancelNormalQueue,
} from "./JoinQueue.js";

export default function FastGameStart() {
  let game_mode;
  Modal("gameMode").then((result) => {
    if (result.isPositive && result.input === "2P 게임") {
      Modal("gameOption").then((option) => {
        if (option.isPositive) {
          if (option.input === "클래식") game_mode = "CLASSIC";
          else if (option.input === "스피드") game_mode = "SPEED";
          changeUrl("/game", {
            option: "2P",
            mode: game_mode,
          });
        }
      });
    }
    if (result.isPositive && result.input === "일반 게임") {
      Modal("gameOption").then((option) => {
        if (option.isPositive) {
          if (option.input === "클래식") game_mode = "CLASSIC";
          else if (option.input === "스피드") game_mode = "SPEED";
          joinNormalQueue({
            action: "join_normal_queue",
            game_mode: game_mode,
          });
          Modal("waitingPlayer").then((res) => {
            // 모달 취소하기 버튼 눌렀을 경우
            if (!res.isPositive) cancelNormalQueue({ action: "" });
          });
        }
      });
    }
    if (result.isPositive && result.input === "토너먼트") {
      joinTournamentQueue({ action: "join_tournament_queue" });
    }
  });
}
