export default function NoFriend() {
  const $noFriendWrapper = document.createElement("div");
  $noFriendWrapper.classList.add("noFriendWrapper");

  const $noFriendIcon = document.createElement("i");
  $noFriendIcon.classList.add("bi", "bi-person-circle", "noFriendIcon");

  const $chooseList = document.querySelector(".titleSelect");

  const $noFriendText = document.createElement("div");
  $noFriendText.classList.add("noFriendText");
  $noFriendText.innerText =
    $chooseList === null || $chooseList.innerHTML === "친구 목록"
      ? "친구 목록이 비었습니다!"
      : "차단 목록이 비었습니다!";

  const $noFriendDetail = document.createElement("div");
  $noFriendDetail.classList.add("noFriendDetail");
  $noFriendDetail.innerText =
    $chooseList === null || $chooseList.innerHTML === "친구 목록"
      ? "누군가를 친구로 추가하면 여기에 표시됩니다."
      : "누군가를 차단하면 여기에 표시됩니다.";

  $noFriendWrapper.appendChild($noFriendIcon);
  $noFriendWrapper.appendChild($noFriendText);
  $noFriendWrapper.appendChild($noFriendDetail);

  return $noFriendWrapper;
}
