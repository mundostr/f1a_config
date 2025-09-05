import { toast, showMessage, confirm } from './utils.js';

const checkIfInstalled = () => {
    const isIOSInstalled = window.navigator.standalone; // iOS
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches; // android, desktop

    if (isIOSInstalled || isStandalone) {
        if (installButton) installButton.style.display = 'none';
    } else {
        if (installButton) installButton.style.display = 'block';
    }
};


// MAIN
const INSTALLABLE = true;
const socket = new WebSocket('http://192.168.4.1:81');
const installButton = document.getElementById('install-button');
const configForm = document.getElementById('config-form');

if ('serviceWorker' in navigator && INSTALLABLE) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        }, function(err) {
            console.log('Service Worker registration failed:', err);
        });
    });
}

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
    
    document.getElementById('flightTime').value = data.flightTime;
};

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;

    checkIfInstalled();

    if (installButton) {
        installButton.style.display = 'block';

        installButton.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choice) => {
                if (choice.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
                installButton.style.display = 'none';
            });
        });
    }
});

window.addEventListener("load", checkIfInstalled);
window.confirm = confirm;

configForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let paramsArray = "";
    const formData = new FormData(event.target);

    for (let item of formData.entries()) paramsArray += `${item[0]}=${item[1]}&`;
    paramsArray = paramsArray.slice(0, -1);
    
    socket.send(paramsArray);
    
    showMessage('Config actualizada');
});
