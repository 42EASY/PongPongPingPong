import Modal from "../Modal/Modal.js";
import changeUrl from "../../Router.js";

export default function FastGameStart(data) {
  Modal("gameMode").then((result) => {
    if (result.isPositive && result.input === "2P 게임") {
      Modal("gameOption").then((option) => {
        if (option.isPositive && option.input === "클래식") {
          //todo: changeUrl("/game")
        }
        if (option.isPositive && option.input === "스피드") {
          //todo: changeUrl("/game")
        }
      });
    }
    if (result.isPositive && result.input === "일반 게임") {
      Modal("gameOption").then((option) => {
        if (option.isPositive && option.input === "클래식") {
          Modal("waitingPlayer").then((res) => {
            if (!res.isPositive) {
              //todo: 게임 대기 취소
            }
          });
        }
        if (option.isPositive && option.input === "스피드") {
          Modal("waitingPlayer").then((res) => {
            if (!res.isPositive) {
              //todo: 게임 대기 취소
            }
          });
        }
      });
    }
    if (result.isPositive && result.input === "토너먼트") {
      //todo: changeUrl("/gameroom")
    }
  });
}
