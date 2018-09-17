const fetchAndSave = (URL, OPTS, saveHandler) => {
  return fetch(URL, OPTS).then(res => {
    if (res.status >= 400 && res.status <= 600) {
      throw new Error("Failed to reach backend")
    }
    return res.json()
  }).then(saveHandler);
};

const getPostOptions = (token, payload) => ({
  method: "POST",
  mode: 'cors',
  headers: {
    'Authorization': 'Bearer ' + token,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

const getGetOptions = (token) => ({
  mode: 'cors',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

export const fetchAndSaveActionCreator = (URL, getOptions, getSaveHandler) => {
  return (PREFIX) => ((...args) => (dispatch) => {
    return fetchAndSave(URL, getOptions(...args), getSaveHandler(PREFIX, dispatch))
  });
};

export const getAndUpdateCreator = (URL, getSaveHandler) => fetchAndSaveActionCreator(URL, getGetOptions, getSaveHandler);

export const postAndUpdateCreator = (URL, getSaveHandler) => fetchAndSaveActionCreator(URL, getPostOptions, getSaveHandler);