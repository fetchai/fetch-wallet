import { Message } from "@keplr-wallet/router";
import { ROUTE } from "./constants";

export class GetMessagingPublicKey extends Message<string> {
  public static type() {
    return "get-messaging-public-key";
  }

  constructor(
    public readonly chainId: string,
    public readonly bearer: string,
    public readonly targetAddress: string | null
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetMessagingPublicKey.type();
  }
}

export class RegisterPublicKey extends Message<string> {
  public static type() {
    return "register-public-key";
  }

  constructor(
    public readonly chainId: string,
    public readonly bearer: string,
    public readonly address: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RegisterPublicKey.type();
  }
}

export class EncryptMessagingMessage extends Message<string> {
  public static type() {
    return "encrypt-messaging-message";
  }

  constructor(
    public readonly chainId: string,
    public readonly targetAddress: string,
    public readonly message: string,
    public readonly bearer: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return EncryptMessagingMessage.type();
  }
}

export class DecryptMessagingMessage extends Message<string> {
  public static type() {
    return "decrypt-messaging-message";
  }

  constructor(
    public readonly chainId: string,
    public readonly cipherText: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DecryptMessagingMessage.type();
  }
}

export class SignMessagingPayload extends Message<string> {
  public static type() {
    return "sign-messaging-payload";
  }

  constructor(
    public readonly chainId: string,
    public readonly payload: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SignMessagingPayload.type();
  }
}
