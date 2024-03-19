export default function EndBtn(mode, hasGameLeft) {
  const $btnWrapper = document.createElement("div");
  $btnWrapper.classList.add("btnWrapper");
  //exit button
  const $exitBtn = document.createElement("button");
  const $exitTxt = document.createElement("div");
  const $exitIcn = document.createElement("i");
  $exitBtn.classList.add("btn", "exit");
  $exitTxt.classList.add("btnTxt");
  $exitIcn.classList.add("bi", "bi-arrow-right");
  $exitTxt.innerHTML = "나가기";
  $exitBtn.appendChild($exitTxt);
  $exitBtn.appendChild($exitIcn);
  //friend button
  const $friendBtn = document.createElement("button");
  const $friendTxt = document.createElement("div");
  const $friendIcn = document.createElement("i");
  $friendBtn.classList.add("btn", "addFriend");
  $friendTxt.classList.add("btnTxt");
  $friendIcn.classList.add("bi", "bi-person-plus");
  $friendTxt.innerHTML = "친구추가";
  $friendBtn.appendChild($friendTxt);
  $friendBtn.appendChild($friendIcn);
  //chat button
  const $chatBtn = document.createElement("button");
  const $chatTxt = document.createElement("div");
  const $chatIcn = document.createElement("i");
  $chatBtn.classList.add("btn", "chatting");
  $chatTxt.classList.add("btnTxt");
  $chatIcn.classList.add("bi", "bi-chat-left-dots");
  $chatTxt.innerHTML = "채팅";
  $chatBtn.appendChild($chatTxt);
  $chatBtn.appendChild($chatIcn);

  if (mode === "2p") $btnWrapper.appendChild($exitBtn);
  else if (mode === "normal") {
    $btnWrapper.appendChild($friendBtn);
    $btnWrapper.appendChild($exitBtn);
  } else if (mode === "tournament") {
    $btnWrapper.appendChild($friendBtn);
    $btnWrapper.appendChild(hasGameLeft ? $chatBtn : $exitBtn);
  }
  return $btnWrapper;
}
