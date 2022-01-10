import { KeyConnectorUserKeyResponse } from "jslib-common/models/response/keyConnectorUserKeyResponse";
import { b64Decode, getQsParam } from "./common";

document.addEventListener("DOMContentLoaded", () => {
  init();
});

let parentUrl: string = null;
let parentOrigin: string = null;
let sentSuccess = false;

async function init() {
  await start();
  onMessage();
}

async function start() {
  sentSuccess = false;

  const data = getQsParam("data");
  if (!data) {
    error("No data.");
    return;
  }

  parentUrl = getQsParam("parent");
  if (!parentUrl) {
    error("No parent.");
    return;
  } else {
    parentUrl = decodeURIComponent(parentUrl);
    parentOrigin = new URL(parentUrl).origin;
  }

  let decodedData: any;
  try {
    decodedData = JSON.parse(b64Decode(data));
  } catch (e) {
    error("Cannot parse data.");
    return;
  }

  const keyConnectorUrl = new URL(decodedData.url);
  const bearerAccessToken = decodedData.token;
  const operation = decodedData.operation;
  const key = decodedData.key;

  if (keyConnectorUrl.hostname === "vault.bitwarden.com") {
    error("Invalid hostname.");
  }

  if (operation === "get") {
    const getRequest = new Request(keyConnectorUrl.href + "/user-keys", {
      cache: "no-store",
      method: "GET",
      headers: new Headers({
        Accept: "application/json",
        Authorization: "Bearer " + bearerAccessToken,
      }),
    });
    getRequest.headers.set("Cache-Control", "no-store");
    getRequest.headers.set("Pragma", "no-cache");

    const response = await fetch(getRequest);
    if (response.status !== 200) {
      error("Error getting key");
      return;
    }
    success(new KeyConnectorUserKeyResponse(await response.json()));
  } else if (operation === "post") {
    const postRequest = new Request(keyConnectorUrl.href + "/user-keys", {
      cache: "no-store",
      method: "POST",
      headers: new Headers({
        Accept: "application/json",
        Authorization: "Bearer " + bearerAccessToken,
        "Content-Type": "application/json; charset=utf-8",
      }),
      body: JSON.stringify({ key: key }),
    });

    const response = await fetch(postRequest);
    if (response.status !== 200) {
      error("Error posting key");
      return;
    }
    success(null);
  } else {
    // TODO: put operation
    error("Unsupported operation.");
  }
}

function onMessage() {
  window.addEventListener(
    "message",
    (event) => {
      if (!event.origin || event.origin === "" || event.origin !== parentOrigin) {
        return;
      }

      if (event.data === "start") {
        start();
      }
    },
    false
  );
}

function error(message: string) {
  parent.postMessage("error|" + message, parentUrl);
}

function success(response: KeyConnectorUserKeyResponse) {
  if (sentSuccess) {
    return;
  }
  parent.postMessage(
    "success|" + response != null && response.key != null ? response.key : "",
    parentUrl
  );
  sentSuccess = true;
}

function info(message: string | object) {
  parent.postMessage("info|" + JSON.stringify(message), parentUrl);
}
