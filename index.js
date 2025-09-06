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
let deferredPrompt;

const INSTALLABLE = false;
const socket = new WebSocket('ws://192.168.4.1:81');
const installButton = document.getElementById('install-button');
const configForm = document.getElementById('config-form');

const startDelay = document.getElementById('startDelay');
const takeoffTime = document.getElementById('takeoffTime');
const climbTime = document.getElementById('climbTime');
const transitionTime = document.getElementById('transitionTime');
const flightTime = document.getElementById('flightTime');
const stabOffset = document.getElementById('stabOffset');
const towAngle = document.getElementById('towAngle');
const circularAngle = document.getElementById('circularAngle');
const takeoffAngle = document.getElementById('takeoffAngle');
const climbAngle = document.getElementById('climbAngle');
const transitionAngle = document.getElementById('transitionAngle');
const flightAngle = document.getElementById('flightAngle');
const dtAngle = document.getElementById('dtAngle');
const stabServoInverted = document.getElementById('stabServoInverted');

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

    if (data.hasOwnProperty('update')) {
        data.update === 'ok' ? showMessage('Config actualizada'): showMessage('Error al actualizar');
    } else {
        startDelay.value = data.startDelay;
        takeoffTime.value = data.takeoffTime;
        climbTime.value = data.climbTime;
        transitionTime.value = data.transitionTime;
        flightTime.value = data.flightTime / 1000; // porque llega en ms
        stabOffset.value = data.stabOffset;
        towAngle.value = data.towAngle;
        circularAngle.value = data.circularAngle;
        takeoffAngle.value = data.takeoffAngle;
        climbAngle.value = data.climbAngle;
        transitionAngle.value = data.transitionAngle;
        flightAngle.value = data.flightAngle;
        dtAngle.value = data.dtAngle;
        stabServoInverted.value = data.stabServoInverted;
    }
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
    if (formData.has('stabServoInverted')) formData.delete('stabServoInverted');
    formData.append('stabServoInverted', stabServoInverted.checked ? '-1': '1');

    // for (let item of formData.entries()) paramsArray += `${item[0]}=${item[1]}|`;
    for (let item of formData.entries()) paramsArray += `${item[1]}|`;
    paramsArray = paramsArray.slice(0, -1);
    
    socket.send(paramsArray);
});
