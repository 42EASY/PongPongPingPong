export default function NavProfileMenu() {
  const $ProfileMenuWrapper = document.createElement("div");
  const $ProfileMenu = document.createElement("ul");
  const $LogoutOption = document.createElement("li");
  const $LogoutIcon = document.createElement("i");

  $ProfileMenuWrapper.classList.add("profileMenuWrapper");
  $ProfileMenuWrapper.appendChild($ProfileMenu);
  $ProfileMenu.classList.add("list-group");
  $ProfileMenu.appendChild($LogoutOption);
  $LogoutOption.classList.add("list-group-item", "profileMenu");
  $LogoutOption.appendChild($LogoutIcon);
  $LogoutOption.append("로그아웃");
  $LogoutIcon.classList.add("bi", "bi-box-arrow-right", "profileMenuIcon");

  return $ProfileMenuWrapper;
}
