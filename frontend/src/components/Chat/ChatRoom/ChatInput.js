export default function ChatInput() {
  const $chatInputWrapper = document.createElement("div");
  $chatInputWrapper.classList.add("chatInputWrapper");

  const $chatInput = document.createElement("input");
  $chatInput.classList.add("chatInput");
  $chatInput.setAttribute("type", "text");
  $chatInput.setAttribute("placeholder", "메세지 보내기");

  const $chatSubmit = document.createElement("i");
  $chatSubmit.classList.add("bi", "bi-send-fill", "chatSubmit");

  $chatInputWrapper.appendChild($chatInput);
  $chatInputWrapper.appendChild($chatSubmit);

  return $chatInputWrapper;
}
