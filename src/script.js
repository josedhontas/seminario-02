let currentN = 8;
let currentBoard = [];
let allSolutions = [];
let currentSolutionIdx = 0;
let steps = [];
let stepIndex = 0;
let playTimer = null;



function drawBoard(n, queens = [], highlight = null) {
    const boardDiv = document.getElementById("board");
    boardDiv.style.gridTemplateColumns = `repeat(${n}, min(55px, 8vmin))`;
    boardDiv.innerHTML = "";

    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell", (row + col) % 2 === 0 ? "light" : "dark");

            if (queens[col] === row) {
                cell.textContent = "♛";
                cell.style.color = "#000";
            }

            if (highlight && highlight.row === row && highlight.col === col) {
                cell.classList.add("highlight-" + highlight.type);
            }

            boardDiv.appendChild(cell);
        }
    }
}



function isSafe(col, row, board) {
    for (let c = 0; c < col; c++) {
        if (board[c] === row) return false;
        if (Math.abs(board[c] - row) === Math.abs(c - col)) return false;
    }
    return true;
}

function* nQueensGenerator(n) {
    let board = Array(n).fill(-1);

    function* solve(col) {
        if (col === n) {
            yield { board: [...board], event: "solution" };
            return true;
        }

        for (let row = 0; row < n; row++) {
            yield { board: [...board], event: "try", row, col };

            if (isSafe(col, row, board)) {
                board[col] = row;
                yield { board: [...board], event: "place", row, col };

                if (yield* solve(col + 1)) {
                    return true;
                }

                board[col] = -1;
                yield { board: [...board], event: "remove", row, col };
            } else {
                yield { board: [...board], event: "conflict", row, col };
            }
        }
        return false;
    }

    yield* solve(0);
}



function solveSingle() {
    stopPlay();
    readN();
    const gen = nQueensGenerator(currentN);
    let res = gen.next();
    let solution = null;

    while (!res.done) {
        if (res.value && res.value.event === "solution") {
            solution = res.value.board;
            break;
        }
        res = gen.next();
    }

    if (solution) {
        currentBoard = solution;
        drawBoard(currentN, currentBoard);
        setStatus(`✅ Solução encontrada para N = ${currentN}.`, "ok");
        setStepInfo("");
        allSolutions = [solution];
        currentSolutionIdx = 0;
        updateSolutionsInfo();
    } else {
        drawBoard(currentN, []);
        setStatus(`❌ Nenhuma solução encontrada para N = ${currentN}.`, "err");
        setStepInfo("");
        allSolutions = [];
        updateSolutionsInfo();
    }
}

function solveAll() {
    stopPlay();
    readN();

    if (currentN > 12) {
        alert("Cuidado! Para listar TODAS as soluções, use N ≤ 12.\nPode demorar bastante.");
    }

    let solutions = [];
    let board = Array(currentN).fill(-1);

    function backtrack(col) {
        if (col === currentN) {
            solutions.push([...board]);
            return;
        }
        for (let row = 0; row < currentN; row++) {
            if (isSafe(col, row, board)) {
                board[col] = row;
                backtrack(col + 1);
                board[col] = -1;
            }
        }
    }

    backtrack(0);

    if (solutions.length === 0) {
        setStatus(`❌ Nenhuma solução para N = ${currentN}.`, "err");
        allSolutions = [];
        currentSolutionIdx = 0;
        drawBoard(currentN, []);
        updateSolutionsInfo();
        return;
    }

    allSolutions = solutions;
    currentSolutionIdx = 0;
    currentBoard = allSolutions[0];
    drawBoard(currentN, currentBoard);
    setStatus(`Encontradas ${solutions.length} soluções para N = ${currentN}.`, "ok");
    setStepInfo("");
    updateSolutionsInfo();
}

function updateSolutionsInfo() {
    const div = document.getElementById("solutions-info");
    if (!allSolutions.length) {
        div.textContent = "Nenhuma solução carregada.";
    } else {
        div.textContent = `Solução ${currentSolutionIdx + 1} de ${allSolutions.length}`;
    }
}

function prevSolution() {
    if (!allSolutions.length) return;
    stopPlay();
    currentSolutionIdx = (currentSolutionIdx - 1 + allSolutions.length) % allSolutions.length;
    currentBoard = allSolutions[currentSolutionIdx];
    drawBoard(currentN, currentBoard);
    updateSolutionsInfo();
}

function nextSolution() {
    if (!allSolutions.length) return;
    stopPlay();
    currentSolutionIdx = (currentSolutionIdx + 1) % allSolutions.length;
    currentBoard = allSolutions[currentSolutionIdx];
    drawBoard(currentN, currentBoard);
    updateSolutionsInfo();
}



function prepareSteps() {
    stopPlay();
    readN();

    const gen = nQueensGenerator(currentN);
    steps = [];
    let r = gen.next();
    while (!r.done) {
        steps.push(r.value);
        r = gen.next();
    }

    if (!steps.length) {
        setStatus("❌ Não foi possível gerar passos.", "err");
        return;
    }

    stepIndex = 0;
    showStep();
    setStatus(`Gerados ${steps.length} passos.`, "ok");
}

function showStep() {
    if (!steps.length) return;

    const step = steps[stepIndex];
    const board = step.board || [];
    let highlight = null;
    let msg = "";

    if (step.event === "try") {
        highlight = { row: step.row, col: step.col, type: "try" };
        msg = `Tentando colocar rainha em (${step.row}, ${step.col})`;
    } else if (step.event === "conflict") {
        highlight = { row: step.row, col: step.col, type: "conflict" };
        msg = `Conflito em (${step.row}, ${step.col})`;
    } else if (step.event === "place") {
        highlight = { row: step.row, col: step.col, type: "place" };
        msg = `Rainha colocada em (${step.row}, ${step.col})`;
    } else if (step.event === "remove") {
        highlight = { row: step.row, col: step.col, type: "remove" };
        msg = `Backtracking removendo (${step.row}, ${step.col})`;
    } else if (step.event === "solution") {
        msg = "Solução completa encontrada!";
    }

    drawBoard(currentN, board, highlight);
    setStepInfo(`Passo ${stepIndex + 1}/${steps.length}: ${msg}`);
}

function nextStep() {
    if (!steps.length) {
        setStatus("Gere os passos primeiro.", "warn");
        return;
    }
    stepIndex = Math.min(stepIndex + 1, steps.length - 1);
    showStep();
}

function prevStep() {
    if (!steps.length) return;
    stepIndex = Math.max(stepIndex - 1, 0);
    showStep();
}

/* PLAY / PAUSE */
function togglePlay() {
    if (playTimer) {
        stopPlay();
        return;
    }
    if (!steps.length) {
        setStatus("Gere os passos primeiro.", "warn");
        return;
    }

    const speed = parseInt(document.getElementById("speed").value, 10) || 200;

    playTimer = setInterval(() => {
        showStep();
        if (stepIndex >= steps.length - 1) {
            stopPlay();
            setStatus("Animação finalizada.", "ok");
        } else {
            stepIndex++;
        }
    }, speed);

    setStatus("Animação rodando...", "info");
}

function stopPlay() {
    if (playTimer) {
        clearInterval(playTimer);
        playTimer = null;
        setStatus("Animação pausada.", "info");
    }
}



function readN() {
    const input = document.getElementById("nValue");
    let n = parseInt(input.value, 10);
    if (isNaN(n) || n < 4) n = 4;
    if (n > 14) n = 14;
    input.value = n;
    currentN = n;
    currentBoard = Array(n).fill(-1);
    drawBoard(currentN, currentBoard);
}

function resetBoard() {
    stopPlay();
    readN();
    allSolutions = [];
    steps = [];
    stepIndex = 0;
    currentSolutionIdx = 0;
    drawBoard(currentN, []);
    setStatus("Tabuleiro limpo.", "info");
    setStepInfo("");
    updateSolutionsInfo();
}

function toggleDark() {
    document.body.classList.toggle("dark");
}

function setStatus(text, type = "info") {
    const el = document.getElementById("status");
    el.textContent = text;
    if (type === "ok") el.style.color = "#8bc34a";
    else if (type === "err") el.style.color = "#ef5350";
    else if (type === "warn") el.style.color = "#ffc107";
    else el.style.color = "#ddd";
}

function setStepInfo(text) {
    document.getElementById("step-info").textContent = text;
}

window.onload = () => {
    readN();
    setStatus("Pronto. Escolha N e uma operação.", "info");
    updateSolutionsInfo();
};
