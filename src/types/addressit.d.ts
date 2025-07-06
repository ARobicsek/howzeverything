// src/types/addressit.d.ts
declare module 'addressit' {
  interface ParsedAddress {
    number?: string;
    street?: string;
    city?: string;
    state?: string;
    postalcode?: string;
    country?: string;
    text: string;
    regions: string[];
  }

  function addressit(address: string | object): ParsedAddress;
  export = addressit;
}