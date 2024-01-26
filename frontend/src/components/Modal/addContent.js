export default function addContentElement(content) {
  var $contentElement;

  switch (content.type) {
    case "text":
      $contentElement = document.createElement("div");
      $contentElement.innerHTML = content.text;
      break;
    case "image":
      $contentElement.document.createElement("img");
      $contentElement.setAttribute("src", content.src);
      $contentElement.setAttribute("alt", content.alt);
      break;
    case "primaryButton":
    case "secondaryButton":
      $contentElement = document.createElement("button");
      if (content.type === "primaryButton")
        $contentElement.classList.add("btn", "primaryButton");
      else
        $contentElement.classList.add("btn", "closeButton", "secondaryButton");
      $contentElement.innerHTML = content.text;
      break;
    default:
      $contentElement = content;
  }

  return $contentElement;
}
