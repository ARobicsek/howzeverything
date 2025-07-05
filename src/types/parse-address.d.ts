// src/types/parse-address.d.ts
declare module 'parse-address' {
  /**
   * Parses a US-based address string into its component parts.
   * @param address The address string to parse.
   * @returns An object containing the parsed address components, or null if parsing fails.
   */
  export function parseLocation(address: string): {
    number?: string;
    prefix?: string;
    street?: string;
    type?: string;
    suffix?: string;
    city?: string;
    state?: string;
    zip?: string;
    sec_unit_type?: string;
    sec_unit_num?: string;
  } | null;
}