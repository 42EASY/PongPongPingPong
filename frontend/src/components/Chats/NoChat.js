export default function NoChat() {
  const $noChatWrapper = document.createElement("div");
  $noChatWrapper.classList.add("noChatWrapper");

  const $noChatIcon = document.createElement("i");
  $noChatIcon.classList.add("bi", "bi-person-circle", "noChatIcon");

  const $noChatText = document.createElement("div");
  $noChatText.classList.add("noChatText");
  $noChatText.innerText = "채팅 목록이 비었습니다!";

  const $noChatDetail = document.createElement("div");
  $noChatDetail.classList.add("noChatDetail");
  $noChatDetail.innerText = "누군가에게 채팅을 전송하면 여기에 표시됩니다.";

  $noChatWrapper.appendChild($noChatIcon);
  $noChatWrapper.appendChild($noChatText);
  $noChatWrapper.appendChild($noChatDetail);

  return $noChatWrapper;
}
