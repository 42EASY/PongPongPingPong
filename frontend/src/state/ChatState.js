let chatContents = [{ id: 0, list: [] }];

const loadChatContent = () => {
  
};

loadChatContent();

export const addChatContent = (id, data) => {
  const idx = chatContents.findIndex((e) => e.id === id);

  if (idx !== -1) chatContents[idx].list.push(data);
  else chatContents.push({ id: id, list: [data] });
};

export const delChatContent = (id) => {
  const idx = chatContents.findIndex((e) => e.id === id);

  if (idx !== -1) {
    chatContents.splice(idx, 1);
  }
};

export const getChatContent = (id) => {
  const elem = chatContents.find((e) => e.id === id);

  if (elem) return elem.list;
  return null;
};

export const getTimestamp = () => {
  const now = new Date();
  const isoString = now.toISOString();
  return isoString;
};
