
export const loadPayU = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // bolt.min.js is loaded via index.html; check if it's ready
    if ((window as any).bolt) {
      resolve(true);
      return;
    }
    // If not yet loaded, wait a bit then re-check
    const check = setInterval(() => {
      if ((window as any).bolt) {
        clearInterval(check);
        resolve(true);
      }
    }, 100);
    // Timeout after 10 s
    setTimeout(() => {
      clearInterval(check);
      resolve(!!(window as any).bolt);
    }, 10000);
  });
};

// Legacy alias kept so existing imports don't break during migration
export const loadRazorpay = loadPayU;
