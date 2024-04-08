import ChatSocketManager from "../state/ChatSocketManager.js";
import BotContent from "../components/Chat/ChatRoom/BotContent.js";
import ChatInput from "../components/Chat/ChatRoom/ChatInput.js";
import Title from "../components/Chat/Title.js";
import { getUserId } from "../state/State.js";

const socket = ChatSocketManager.getInstance();

export default function BotRoom() {
  const $botRoomWrapper = document.querySelector(".sidebarArea");
  $botRoomWrapper.innerHTML = "";

  // 타이틀
  const $titleBox = document.createElement("div");
  $titleBox.classList.add("titleBox");
  $titleBox.appendChild(
    Title({
      nickname: "announcement_bot",
      image_url: "./src/images/sponge.png",
    })
  );
  $botRoomWrapper.appendChild($titleBox);

  // 이전 채팅 내용 받아오기
  const $botContentsWrapper = document.createElement("div");
  $botContentsWrapper.classList.add("chatContentsWrapper");
  $botRoomWrapper.appendChild($botContentsWrapper);

  socket.send(
    JSON.stringify({
      action: "fetch_bot_notify_messages",
      user_id: getUserId(),
    })
  );

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);

    if (data.action === "fetch_bot_notify_messages") {
      for (const message of data.data) {
        $botContentsWrapper.appendChild(BotContent(message));
      }
      $botRoomWrapper.scrollTop = $botRoomWrapper.scrollHeight;
    } else if (
      data.action === "bot_notify_tournament_game_result" ||
      data.action === "bot_notify_invited_normal_game" ||
      data.action === "bot_notify_invited_tournament_game" ||
      data.action === "bot_notify_tournament_game_opponent"
    ) {
      $botContentsWrapper.appendChild(BotContent(data));
      $botRoomWrapper.scrollTop = $botRoomWrapper.scrollHeight;
    }
  };

  // 채팅 입력칸
  $botRoomWrapper.appendChild(ChatInput());
  const $chatInput = document.querySelector(".chatInput");
  $chatInput.disabled = true;
}
