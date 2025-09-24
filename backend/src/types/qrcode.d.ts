declare module 'qrcode' {
  export interface QRCodeColorOptions {
    dark?: string;
    light?: string;
  }

  export interface QRCodeToDataURLOptions {
    width?: number;
    margin?: number;
    color?: QRCodeColorOptions;
  }

  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions,
  ): Promise<string>;
}
