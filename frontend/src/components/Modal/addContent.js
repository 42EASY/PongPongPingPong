export default function addContentElement(content) {
  var $contentElement;

  switch (content.type) {
    case "text":
      $contentElement = document.createElement("p");
      $contentElement.innerHTML = content.text;
      console.log(content.text); /////////////////
      break;
    case "image":
      $contentElement.document.createElement("img");
      $contentElement.setAttribute("src", content.src);
      $contentElement.setAttribute("alt", content.alt);
      break;
    case "primary-button":
    case "secondary-button":
      $contentElement = document.createElement("button");
      if (content.type === "primary-button")
        $contentElement.classList.add("btn", "btn-primary");
      else $contentElement.classList.add("btn", "btn-secondary");
      if (content.dismiss)
        $contentElement.setAttribute("data-bs-dismiss", "modal");
      $contentElement.innerHTML = content.text;
      console.log("here");
      break;
    default:
      $contentElement = content;
  }

  return $contentElement;
}
