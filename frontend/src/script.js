document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.style.display = 'none';
    console.log("here");

    window.addEventListener('load', function() {
        document.documentElement.style.display = 'block';
    });
});