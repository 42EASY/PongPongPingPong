export default function OtherBtn({ status }) {
  let curStatus = status; //0: not friend, 1: friend, 2: blocked

  const $OtherBtnWrapper = document.createElement("div");
  const $FriendStatusBtn = document.createElement("button");
  const $FriendStatusIcon = document.createElement("i");
  const $MessageBtn = document.createElement("button");
  const $MoreFunctionBtn = document.createElement("button");
  const $MoreFucntionIcon = document.createElement("i");

  $OtherBtnWrapper.appendChild($FriendStatusBtn);
  $OtherBtnWrapper.appendChild($MessageBtn);
  $OtherBtnWrapper.appendChild($MoreFunctionBtn);
  $MoreFunctionBtn.appendChild($MoreFucntionIcon);
  $OtherBtnWrapper.classList.add("btnWrapper");
  $FriendStatusBtn.classList.add("mainBtn");
  $FriendStatusIcon.classList.add("bi", "bi-plus-lg", "friendStatusIcon");
  $MessageBtn.classList.add("mainBtn");
  $MessageBtn.innerHTML = "메세지";
  $MoreFunctionBtn.classList.add("mainBtn", "MoreFunctionBtn");
  $MoreFucntionIcon.classList.add("bi", "bi-three-dots");

  const onChangeStatus = (nextStatus) => {
    curStatus = nextStatus;
    if (nextStatus === 0) {
      //Not Friend
      $FriendStatusBtn.classList.remove("statusBlocked");
      $FriendStatusBtn.classList.add("statusNotFriend");
      $FriendStatusBtn.innerHTML = "";
      $FriendStatusBtn.appendChild($FriendStatusIcon);
      $FriendStatusBtn.append("친구 추가");
    } else if (nextStatus === 1) {
      // Friend
      $FriendStatusBtn.classList.remove("statusNotFriend", "statusBlocked");
      $FriendStatusBtn.innerHTML = "친구";
    } else if (nextStatus === 2) {
      // Blocked
      $FriendStatusBtn.classList.remove("statusNotFriend");
      $FriendStatusBtn.classList.add("statusBlocked");
      $FriendStatusBtn.innerHTML = "차단됨";
      $MoreFunctionBtn.remove();
    }
  };

  $FriendStatusBtn.onclick = () => {
    if (curStatus === 0) onChangeStatus(1);
    else if (curStatus === 2) onChangeStatus(0);
  };

  onChangeStatus(curStatus);
  return $OtherBtnWrapper;
}
