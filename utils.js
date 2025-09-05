export const toast = new bootstrap.Toast(message, { autohide: false });
export const toastAutohide = new bootstrap.Toast(message, { autohide: true, delay: 3000 });
const toastElement = document.getElementById('jsonToast');
export const toastImport = new bootstrap.Toast(toastElement);

export const showMessage = (msg, hide = true) => {
    const messageBody = document.getElementById('message-body');
    messageBody.innerHTML = msg;
    
    hide ? toastAutohide.show(): toast.show();
}

export const confirm = async (title, routine) => {
    showMessage(`
        <p>${title}</p>
        <button class="btn btn-light" onclick="${routine}()">Sí</button>
        `, false);
}
