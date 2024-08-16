
export const generateUUID = (len: number): string => {
  let uuid = '';

  while (uuid.length < len) {
    uuid += Math.random().toString(36).substr(2, 11);
  }

  return uuid.slice(0, len);
};
