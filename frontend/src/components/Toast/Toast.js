
const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.className += ' show';
        setTimeout(() => {
            toast.className = toast.className.replace(' show', '');
            document.body.removeChild(toast);
        }, 3000);
    });
};

export default showToast;
