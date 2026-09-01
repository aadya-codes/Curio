const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

});

document.querySelectorAll(".hidden").forEach(card=>{

    observer.observe(card);

});

document.querySelectorAll(".entry").forEach(entry => {

    entry.addEventListener("click", (event) => {

        if (
            entry.classList.contains("sudoku-entry") &&
            event.target.closest(".entry-content")
        ) {
            return;
        }

        entry.classList.toggle("open");

    });

});

document.querySelectorAll(".answer-btn").forEach(button => {

    button.addEventListener("click", (event) => {

        event.stopPropagation();

        const answer = button.nextElementSibling;

        answer.classList.toggle("open");

        button.textContent = answer.classList.contains("open")
            ? "Hide Answer"
            : "I give up.";

    });

});

const title = document.getElementById("actual-title");

if (title && window.innerWidth > 600) {
    const radius = 140;
    const wghtMin = 50;
    const wghtMax = 1000;

    [..."Curio"].forEach(char => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        title.appendChild(span);
    });

    const pointer = { x: -9999, y: -9999, active: false };

    title.addEventListener("pointermove", e => {
        const rect = title.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        pointer.active = true;
    });

    title.addEventListener("pointerleave", () => {
        pointer.active = false;
    });

    function animateTitle() {
        const rect = title.getBoundingClientRect();

        for (const span of title.children) {
            const r = span.getBoundingClientRect();
            const cx = (r.left + r.right) / 2 - rect.left;
            const cy = (r.top + r.bottom) / 2 - rect.top;

            let force = 0;

            if (pointer.active) {
                const dx = cx - pointer.x;
                const dy = cy - pointer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                force = Math.pow(Math.max(0, 1 - distance / radius), 1.4);
            }

            const weight = wghtMin + (wghtMax - wghtMin) * force;

            span.style.fontVariationSettings = `'wght' ${weight.toFixed(0)}`;
            if (window.innerWidth > 600) {
                span.style.transform = `scale(${(1 + force * 0.18).toFixed(3)})`;
            } else {
                span.style.transform = "none";
}
        }

        requestAnimationFrame(animateTitle);
    }

    animateTitle();
} else if (title) {
    title.textContent = "Curio";
}

document.addEventListener("DOMContentLoaded", () => {

    const puzzle = [
        [0, 7, 0, 8, 0, 0, 0, 9, 0],
        [9, 0, 0, 0, 7, 0, 0, 0, 3],
        [0, 0, 0, 5, 0, 0, 0, 7, 0],
        [1, 0, 0, 0, 8, 4, 0, 0, 0],
        [7, 0, 0, 0, 0, 0, 0, 8, 1],
        [8, 0, 0, 0, 5, 0, 4, 0, 0],
        [0, 0, 0, 0, 0, 0, 9, 2, 0],
        [4, 9, 0, 0, 0, 3, 1, 0, 8],
        [0, 0, 6, 0, 2, 8, 3, 0, 0]
    ];

    const solution = [
        [2, 7, 5, 8, 3, 1, 6, 9, 4],
        [9, 4, 8, 6, 7, 2, 5, 1, 3],
        [6, 3, 1, 5, 4, 9, 8, 7, 2],
        [1, 6, 9, 2, 8, 4, 7, 3, 5],
        [7, 5, 4, 3, 9, 6, 2, 8, 1],
        [8, 2, 3, 1, 5, 7, 4, 6, 9],
        [3, 8, 7, 4, 1, 5, 9, 2, 6],
        [4, 9, 2, 7, 6, 3, 1, 5, 8],
        [5, 1, 6, 9, 2, 8, 3, 4, 7]
    ];

    const sudoku = document.getElementById("sudoku");

    if (!sudoku) {
        console.warn("No #sudoku element found on this page.");
        return;
    }

    let selectedCell = null;

    puzzle.forEach((row, r) => {
        row.forEach((value, c) => {

            const cell = document.createElement("div");

            cell.classList.add("sudoku-cell");

            cell.dataset.row = r;
            cell.dataset.col = c;

            if (value !== 0) {

                cell.textContent = value;
                cell.classList.add("given");

            } else {

                cell.addEventListener("click", (event) => {

                    event.stopPropagation();

                    document
                        .querySelectorAll(".sudoku-cell")
                        .forEach(c => c.classList.remove("selected"));

                    cell.classList.add("selected");

                    selectedCell = cell;
                });
            }

            sudoku.appendChild(cell);
        });
    });

function checkSolved() {
    const cells = document.querySelectorAll(".sudoku-cell");

    for (const cell of cells) {
        if (cell.classList.contains("given")) {
            continue;
        }

        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);

        if (Number(cell.textContent) !== solution[row][col]) {
            return false;
        }
    }

    return true;
}

    document.querySelectorAll(".number-pad button").forEach(button => {

        button.addEventListener("click", (event) => {

            event.stopPropagation();

            if (!selectedCell) {
                return;
            }

            const number = Number(button.dataset.number);

            const row = Number(selectedCell.dataset.row);
            const col = Number(selectedCell.dataset.col);

            if (number === solution[row][col]) {

                selectedCell.textContent = number;

                if (checkSolved()) {
                    const message = document.getElementById("sudoku-message");

                    message.textContent =
                        "You solved it! (hopefully without guesswork or spamming...)";

                    message.classList.add("solved");
                }

            } else {

                // Wrong → blip, then disappear
                selectedCell.textContent = number;
                selectedCell.classList.add("wrong");

                setTimeout(() => {
                    selectedCell.textContent = "";
                    selectedCell.classList.remove("wrong");
                }, 300);
            }

        });

    });

});

document.querySelectorAll(".peek-button").forEach(button => {

    button.addEventListener("click", event => {

        event.stopPropagation();

        const peek = button.parentElement;

        peek.classList.toggle("open");

    });

});