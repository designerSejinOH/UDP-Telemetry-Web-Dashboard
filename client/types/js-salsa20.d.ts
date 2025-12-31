declare module "js-salsa20" {
  export default class JSSalsa20 {
    constructor(key: Uint8Array, nonce: Uint8Array);
    encrypt(data: Uint8Array): Uint8Array;
    decrypt(data: Uint8Array): Uint8Array;
  }
}
