import { getNickname } from "../../../state/State.js";
import Modal from "../../Modal/Modal.js";
import {
  joinInviteNormalQueue,
  joinInviteTournamentQueue,
} from "../../Nav/JoinQueue.js";
import { formatTimestamp } from "./ChatContent.js";

export default function BotContent(data) {
  const $botContentWrapper = document.createElement("div");
  $botContentWrapper.classList.add("chatContentWrapper");

  const $botContentImg = document.createElement("img");
  $botContentImg.setAttribute("src", "./src/images/sponge.png");
  $botContentImg.setAttribute("alt", "botProfileImg");
  $botContentImg.classList.add("chatContentImg");

  const $botContentRight = document.createElement("div");
  $botContentRight.classList.add("chatContentRight");

  const $botContentInfo = document.createElement("div");
  $botContentInfo.classList.add("chatContentInfo");

  const $botContentName = document.createElement("div");
  $botContentName.classList.add("chatContentName");
  $botContentName.innerHTML = "announcement_bot";

  const $botContentTime = document.createElement("div");
  $botContentTime.classList.add("chatContentTime");
  $botContentTime.innerHTML = formatTimestamp(data.timestamp);

  const $botContentBox = document.createElement("div");

  const $botContent = document.createElement("div");
  $botContent.classList.add("chatChatContent");

  const $botContentBtn = document.createElement("div");
  $botContentBtn.classList.add("btn", "chatContentBtn");

  $botContentInfo.appendChild($botContentName);
  $botContentInfo.appendChild($botContentTime);
  $botContentRight.appendChild($botContentInfo);
  $botContentRight.appendChild($botContentBox);
  $botContentBox.appendChild($botContent);
  $botContentWrapper.appendChild($botContentImg);
  $botContentWrapper.appendChild($botContentRight);

  if (data.action === "bot_notify_tournament_game_result") {
    const msg = `토너먼트가 종료되었습니다`;
    $botContent.innerHTML = msg;
    $botContentBtn.innerHTML = "결과 확인하기";
    $botContentBox.appendChild($botContentBtn);

    $botContentBtn.onclick = () => {
      Modal("gameResultTable", data.players);
    };
  }
  if (data.action === "bot_notify_invited_normal_game") {
    const mode = data.mode === "SPEED" ? "스피드" : "클래식";
    const msg = `${data.inviter.nickname} 님이 일반 게임 - ${mode} 게임을 요청했습니다`;
    $botContent.innerHTML = msg;
    $botContentBtn.innerHTML = "게임하러 가기";
    $botContentBox.appendChild($botContentBtn);

    $botContentBtn.onclick = () => {
      if (
        !joinInviteNormalQueue({
          action: "join_invite_normal_queue",
          game_id: data.game_id,
        })
      ) {
        Modal("invalidGame");
        $botContentBtn.classList.add("invalidBtn");
      }
    };
  }
  if (data.action === "bot_notify_invited_tournament_game") {
    const msg = `${data.inviter.nickname} 님이 토너먼트 게임을 요청했습니다`;
    $botContent.innerHTML = msg;
    $botContentBtn.innerHTML = "게임하러 가기";
    $botContentBox.appendChild($botContentBtn);
    $botContentBtn.onclick = () => {
      const res = joinInviteTournamentQueue({
        action: "join_invite_tournament_queue",
        room_id: data.room_id,
      });
      if (res.message === "인원이 다 찬 게임방입니다")
        Modal("enterFail_fullRoom");
      else Modal("invalidGame");
      $botContentBtn.classList.add("invalidBtn");
    };
  }
  if (data.action === "bot_notify_tournament_game_opponent") {
    const msg = `${getNickname()} 님의 다음 대결 상대는 ${
      data.opponent.nickname
    } 님 입니다`;
    $botContent.innerHTML = msg;
  }

  return $botContentWrapper;
}
