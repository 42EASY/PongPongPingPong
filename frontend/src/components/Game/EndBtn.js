export default function EndBtn(mode) {
  const $btnBox = document.createElement("div");
  const $fstBtn = document.createElement("button");
  const $sndBtn = document.createElement("button");
  const $fstTxt = document.createElement("div");
  const $sndTxt = document.createElement("div");
  const $fstIcn = document.createElement("i");
  const $sndIcn = document.createElement("i");

  $btnBox.classList.add("btnBox");
  $fstBtn.classList.add("btn", "addFriend");
  $sndBtn.classList.add("btn", mode === "default" ? "exit" : "chatting");
  $fstTxt.classList.add("btnTxt", "fstTxt");
  $sndTxt.classList.add("btnTxt", "sndTxt");
  $fstIcn.classList.add("bi", "bi-person-plus", "fstIcn");
  $sndIcn.classList.add(
    "bi",
    mode === "default" ? "bi-arrow-right" : "bi-chat-left-dots",
    "sndIcn"
  );

  $btnBox.appendChild($fstBtn);
  $btnBox.appendChild($sndBtn);
  $fstBtn.appendChild($fstIcn);
  $sndBtn.appendChild($sndIcn);
  $fstBtn.appendChild($fstTxt);
  $sndBtn.appendChild($sndTxt);

  $fstTxt.innerHTML = "친구 추가";
  $sndTxt.innerHTML = mode === "default" ? "나가기" : "채팅";
  return $btnBox;
}
