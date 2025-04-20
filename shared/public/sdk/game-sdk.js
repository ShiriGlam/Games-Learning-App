window.GameAPI = {
  getWords: () => {
    return new Promise((resolve) => {
      console.log("[GameSDK] Requesting words from parent...");

      window.addEventListener('message', function handler(event) {
        console.log("[GameSDK] Received message:", event.data);
        if (event.data?.type === 'injectWords') {
          window.removeEventListener('message', handler);
          resolve(event.data.words);
        }
      });

      window.opener?.postMessage({ type: 'requestWords' }, '*');
    });
  },

  reportResult: (word, success) => {
    console.log(`[GameSDK] Reporting result for "${word}": ${success}`);
    window.opener?.postMessage({
      type: 'gameEvent',
      event: success ? 'success' : 'failure',
      details: { word }
    }, '*');
  }
};
