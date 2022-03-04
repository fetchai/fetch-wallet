import { JSONUint8Array, Result } from "@keplr-wallet/router";
import { Method } from "./types";

export interface ProxyRequest {
  type: "fetchai:proxy-request-v1";
  id: string;
  method: Method;
  args: any[];
}

export interface ProxyResponse {
  type: "fetchai:proxy-response-v1";
  id: string;
  result: Result | undefined;
}

function generateNewRequestId(): string {
  const bytes = new Uint8Array(8);
  return Array.from(crypto.getRandomValues(bytes))
    .map((value) => {
      return value.toString(16);
    })
    .join("");
}

export function createProxyRequest(method: Method, args: any[]): ProxyRequest {
  return {
    type: "fetchai:proxy-request-v1",
    id: generateNewRequestId(),
    method,
    args: JSONUint8Array.wrap(args),
  };
}

export function createProxyResponse(
  id: string,
  result: Result | undefined
): ProxyResponse {
  return {
    type: "fetchai:proxy-response-v1",
    id,
    result,
  };
}

function isProxyRequest(obj: any): obj is ProxyRequest {
  return !(!obj || obj.type !== "fetchai:proxy-request-v1" || !obj.id);
}

function isProxyPresonse(obj: any): obj is ProxyResponse {
  return !(!obj || obj.type !== "fetchai:proxy-response-v1" || !obj.id);
}

export function toProxyRequest(obj: any): ProxyRequest | undefined {
  if (isProxyRequest(obj)) {
    return obj;
  }
}

export function toProxyResponse(obj: any): ProxyResponse | undefined {
  if (isProxyPresonse(obj)) {
    return obj;
  }
}

export interface Proxy {
  addMessageHandler: (handler: (e: any) => void) => void;
  removeMessageHandler: (handler: (e: any) => void) => void;
  sendMessage: (message: any) => void;
}

export function createBrowserWindowProxy(): Proxy {
  return {
    addMessageHandler: (fn: (e: any) => void) =>
      window.addEventListener("message", fn),
    removeMessageHandler: (fn: (e: any) => void) =>
      window.removeEventListener("message", fn),
    sendMessage: (message) =>
      window.postMessage(message, window.location.origin),
  };
}
