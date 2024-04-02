import WebSocketManager from "../state/WebSocketManager.js";
import BotContent from "../components/Chat/ChatRoom/BotContent.js";
import ChatInput from "../components/Chat/ChatRoom/ChatInput.js";
import Title from "../components/Chat/Title.js";

const socket = WebSocketManager.getInstance();

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
      action: "",
    })
  );
  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    // todo: fetch messages
    if (data.action === "") {
      for (const message of data.messages)
        $botContentsWrapper.appendChild(BotContent(message));
      $botRoomWrapper.scrollTop = $botRoomWrapper.scrollHeight;
    } else if (data.action !== "fail") {
      $botContentsWrapper.appendChild(BotContent(data));
      // todo: send - update_read_time
      socket.send(
        JSON.stringify({
          action: "",
        })
      );
      $botRoomWrapper.scrollTop = $botRoomWrapper.scrollHeight;
    }
  };

  // 채팅 입력칸
  $botRoomWrapper.appendChild(ChatInput());
  const $chatInput = document.querySelector(".chatInput");
  $chatInput.disabled = true;
}
