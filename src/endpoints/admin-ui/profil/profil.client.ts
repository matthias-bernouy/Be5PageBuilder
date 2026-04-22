import "src/ui/Form/FormSection";

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    const logoutUrl = logoutBtn?.getAttribute("data-logout-url");
    if (logoutBtn && logoutUrl) {
        logoutBtn.addEventListener("click", () => {
            window.location.href = logoutUrl;
        });
    }

    const tokensBtn = document.getElementById("manage-tokens-btn");
    const tokensUrl = tokensBtn?.getAttribute("data-tokens-url");
    if (tokensBtn && tokensUrl) {
        tokensBtn.addEventListener("click", () => {
            window.location.href = tokensUrl;
        });
    }
});
