// src/utils/apiCounter.ts
let count = 0;

export const incrementGeoapifyCount = () => {
  count++;
};

export const getGeoapifyCount = (): number => {
  return count;
};

export const logGeoapifyCount = () => {
  console.log(`%cGeoapify API Calls (session): ${count}`, 'color: #642e32; font-weight: bold; background-color: #DBEAFE; padding: 2px 6px; border-radius: 4px;');
};