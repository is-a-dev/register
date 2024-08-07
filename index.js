document.addEventListener("DOMContentLoaded", function() {
    // Sélectionne tous les éléments avec la classe "code"
    const codeElements = document.querySelectorAll('.blink');
    
    // Fonction pour alterner la visibilité des éléments
    function toggleVisibility() {
        codeElements.forEach(element => {
            if (element.style.visibility === 'hidden') {
                element.style.visibility = 'visible';
            } else {
                element.style.visibility = 'hidden';
            }
        });
    }
    
    // Définit l'intervalle de clignotement (par exemple, toutes les 500 ms)
    setInterval(toggleVisibility, 500);
});
document.getElementById("sewt-desc").innerText = "a little </> websites </> developer."