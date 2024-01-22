export default function NoFriend() {
  const $noFriendWrapper = document.createElement("div");
  $noFriendWrapper.classList.add("noFriendWrapper");

  const $noFriendIcon = document.createElement("i");
  $noFriendIcon.classList.add("bi", "bi-person-circle", "noFriendIcon");

  const $noFriendText = document.createElement("div");
  $noFriendText.classList.add("noFriendText");
  $noFriendText.innerText = "친구 목록이 비었습니다!";

  const $noFriendDetail = document.createElement("div");
  $noFriendDetail.classList.add("noFriendDetail");
  $noFriendDetail.innerText = "누군가를 친구로 추가하면 여기에 표시됩니다.";

  $noFriendWrapper.appendChild($noFriendIcon);
  $noFriendWrapper.appendChild($noFriendText);
  $noFriendWrapper.appendChild($noFriendDetail);

  return $noFriendWrapper;
}
