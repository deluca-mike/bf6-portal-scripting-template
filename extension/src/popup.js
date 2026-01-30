const PORTAL_ORIGIN = 'https://portal.battlefield.com';

const domainMessage = document.getElementById('domainMessage');
const actions = document.getElementById('actions');
const getSessionIdBtn = document.getElementById('getSessionId');
const getModIdBtn = document.getElementById('getModId');
const refreshBtn = document.getElementById('refresh');
const sessionIdDisplay = document.getElementById('sessionIdDisplay');
const displayRow = document.getElementById('displayRow');
const copyDisplayBtn = document.getElementById('copyDisplayBtn');

function showActions(show) {
    domainMessage.style.display = show ? 'none' : 'block';
    actions.style.display = show ? 'flex' : 'none';
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = tab?.url ? new URL(tab.url) : null;
    const onPortal = url && url.origin === PORTAL_ORIGIN;

    showActions(onPortal);
});

getSessionIdBtn.addEventListener('click', () => {
    displayRow.classList.remove('visible');

    chrome.cookies.get({ url: PORTAL_ORIGIN, name: 'bf6sessionId' }, (cookie) => {
        const value = cookie ? cookie.value : '(cookie not found)';
        sessionIdDisplay.textContent = value;
        displayRow.classList.add('visible');
    });
});

getModIdBtn.addEventListener('click', () => {
    displayRow.classList.remove('visible');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        const url = tab?.url ? new URL(tab.url) : null;
        const id = url?.searchParams.get('id') ?? null;
        sessionIdDisplay.textContent = id ?? '(no id parameter)';
        displayRow.classList.add('visible');
    });
});

copyDisplayBtn.addEventListener('click', () => {
    const value = sessionIdDisplay.textContent;

    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
        const label = copyDisplayBtn.textContent;

        copyDisplayBtn.textContent = 'Copied!';
        copyDisplayBtn.disabled = true;

        setTimeout(() => {
            copyDisplayBtn.textContent = label;
            copyDisplayBtn.disabled = false;
        }, 1500);
    });
});

refreshBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;

        if (tabId == null) return;

        chrome.scripting.executeScript({
            target: { tabId },
            world: 'MAIN',
            func: () => {
                return (async () => {
                    const dbs = await indexedDB.databases();

                    for (const db of dbs) {
                        if (db.name != 'keyval-store') continue;

                        await new Promise((resolve, reject) => {
                            const req = indexedDB.deleteDatabase(db.name);
                            req.onsuccess = () => resolve();
                            req.onerror = () => reject(req.error);
                            req.onblocked = () => resolve();
                        });
                    }

                    location.reload();
                })();
            },
        });
    });
});
