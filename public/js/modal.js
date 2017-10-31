$("#openModal").click(() => {
    $('#addTargetModal').show();
});

$("#closeModal").click(() => {
    $('#addTargetModal').hide();
});

window.onclick = function(event) {
    if (event.target != document.getElementById("addTargetModal") && event.target != document.getElementById("openModal")) {
        $('#addTargetModal').hide();
    }
} 