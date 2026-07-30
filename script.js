// ==============================
// 전역 변수
// ==============================
let allQuestions = [];
let questions = [];

let current = 0;
let score = 0;
let username = "";

let wrongQuestions = [];

// ==============================
// JSON 읽기
// ==============================
window.onload = async () => {
    const response = await fetch("questions.json");
    allQuestions = await response.json();

    createCategory();

    // 이름 입력창 초기화 (항상 비워둡니다)
    document.getElementById("username").value = "";

    const savedCategory = localStorage.getItem("category");
    if(savedCategory){
        document.getElementById("category").value = savedCategory;
    }
};

// ==============================
// 카테고리 생성
// ==============================
function createCategory(){
    const select = document.getElementById("category");
    const categories = [...new Set(allQuestions.map(q => q.category))];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// ==============================
// 퀴즈 시작
// ==============================
function startQuiz(){
    username = document.getElementById("username").value.trim();
    localStorage.setItem("username", username);

    if(username === ""){
        alert("이름을 입력해주세요.");
        return;
    }

    const selectedCategory = document.getElementById("category").value;
    localStorage.setItem("category", selectedCategory);

    // 카테고리 필터링
    if(selectedCategory === "전체"){
        questions = [...allQuestions];
    } else {
        questions = allQuestions.filter(q => q.category === selectedCategory);
    }

    // 🎲 [기능 개선 1] 선택한 모든 조건에서 문제가 랜덤으로 섞이도록 처리
    questions.sort(() => Math.random() - 0.5);

    current = 0;
    score = 0;
    wrongQuestions = [];

    document.getElementById("start").style.display = "none";
    document.getElementById("quiz").style.display = "block";

    showQuestion();
}

// ==============================
// 문제 출력
// ==============================
function showQuestion(){
    const q = questions[current];

    document.getElementById("categoryName").innerText = `📂 ${q.category}`;
    document.getElementById("questionNumber").innerText = `${current + 1}번 문제`; // 문제 번호는 진행 순서대로 표시
    document.getElementById("question").innerText = q.question;

    const percent = ((current + 1) / questions.length) * 100;
    document.getElementById("progressFill").style.width = percent + "%";
    document.getElementById("progressText").innerText = `${current + 1} / ${questions.length}`;

    document.getElementById("result").innerHTML = "";
    document.getElementById("nextBtn").style.display = "none";

    // 버튼 활성화 및 스타일 초기화
    const oBtn = document.querySelector(".oBtn");
    const xBtn = document.querySelector(".xBtn");

    oBtn.disabled = false;
    xBtn.disabled = false;
    oBtn.style.background = "#28a745";
    xBtn.style.background = "#dc3545";
    oBtn.style.opacity = "1";
    xBtn.style.opacity = "1";
}

// ==============================
// 정답 확인
// ==============================
function checkAnswer(userAnswer){
    const oBtn = document.querySelector(".oBtn");
    const xBtn = document.querySelector(".xBtn");

    if(oBtn.disabled) return;

    const q = questions[current];

    oBtn.disabled = true;
    xBtn.disabled = true;
    oBtn.style.opacity = ".6";
    xBtn.style.opacity = ".6";

    // 정답 위치 하이라이트
    if(q.answer){
        oBtn.style.background = "#198754";
    } else {
        xBtn.style.background = "#198754";
    }

    // 💡 [기능 개선 2] 오답 시 밑에 바로 해설 표시
    if(userAnswer === q.answer){
        score++;
        document.getElementById("result").innerHTML = `<div style="color:#198754;">✅ 정답입니다!</div>`;
    } else {
        wrongQuestions.push({
            number: q.number,
            category: q.category,
            question: q.question,
            correct: q.answer,
            user: userAnswer,
            description: q.description
        });

        document.getElementById("result").innerHTML = `
            <div style="color:#dc3545; margin-bottom:10px;">❌ 오답입니다.</div>
            <div style="font-size:16px; font-weight:normal; background:#f8f9fa; border-left:4px solid #dc3545; padding:12px; border-radius:6px; text-align:left; color:#333; line-height:1.5;">
                💡 <strong>해설:</strong> ${q.description || "해설이 준비되지 않았습니다."}
            </div>
        `;
    }

    document.getElementById("nextBtn").style.display = "block";
}

// ==============================
// 다음 문제
// ==============================
function nextQuestion(){
    current++;

    if(current >= questions.length){
        finishQuiz();
        return;
    }

    showQuestion();
}

// ==============================
// 결과 화면
// ==============================
function finishQuiz(){
    const percent = Math.round((score / questions.length) * 100);

    document.querySelector(".container").innerHTML = `
        <h1>🎉 퀴즈 종료</h1>
        <h2>${username}님의 결과</h2>
        <h2>${score} / ${questions.length}점</h2>
        <h3>정답률 : ${percent}%</h3>
        <br>
        <button onclick="showWrongNote()" style="width:100%; height:50px; background:#0d6efd; color:white; border-radius:10px; font-size:18px; margin-bottom:10px;">
            📖 오답노트 보기
        </button>
        <button onclick="location.reload()" style="width:100%; height:50px; background:#6c757d; color:white; border-radius:10px; font-size:18px;">
            🔄 처음부터 다시
        </button>
    `;
}

// ==============================
// 오답노트 화면
// ==============================
function showWrongNote(){
    const container = document.querySelector(".container");

    if(wrongQuestions.length === 0){
        container.innerHTML = `
            <h1>🎉 틀린 문제가 없습니다!</h1>
            <p style="text-align:center; font-size:18px; margin:20px 0;">모든 문제를 맞히셨습니다. 축하합니다!</p>
            <button onclick="location.reload()" style="width:100%; height:50px; background:#0d6efd; color:white; border-radius:10px; font-size:18px;">
                🔄 처음으로 돌아가기
            </button>
        `;
        return;
    }

    let wrongHtml = `<h1>📖 오답 노트</h1>`;

    wrongQuestions.forEach((q) => {
        wrongHtml += `
            <div class="wrongCard">
                <h3>[${q.category}] ${q.number}번 문제</h3>
                <p><strong>문제:</strong> ${q.question}</p>
                <p><strong>내 제출:</strong> <span style="color:#dc3545; font-weight:bold;">${q.user ? "⭕ O" : "❌ X"}</span></p>
                <p><strong>정답:</strong> <span style="color:#28a745; font-weight:bold;">${q.correct ? "⭕ O" : "❌ X"}</span></p>
                <p style="background:#eef3f8; padding:10px; border-radius:8px; margin-top:10px;">
                    💡 <strong>해설:</strong> ${q.description || "해설이 없습니다."}
                </p>
            </div>
        `;
    });

    wrongHtml += `
        <br>
        <button onclick="retryWrongQuestions()" style="width:100%; height:50px; background:#28a745; color:white; border-radius:10px; font-size:18px; margin-bottom:10px;">
            ✏️ 틀린 문제만 다시 풀기
        </button>
        <button onclick="location.reload()" style="width:100%; height:50px; background:#0d6efd; color:white; border-radius:10px; font-size:18px;">
            🔄 처음으로 돌아가기
        </button>
    `;

    container.innerHTML = wrongHtml;
}

// ==============================
// 틀린 문제만 다시 풀기
// ==============================
function retryWrongQuestions(){
    questions = wrongQuestions.map(item => ({
        number: item.number,
        category: item.category,
        question: item.question,
        answer: item.correct,
        description: item.description
    }));

    // 틀린 문제 재도전 시에도 무작위로 섞어줌
    questions.sort(() => Math.random() - 0.5);

    current = 0;
    score = 0;
    wrongQuestions = [];

    document.querySelector(".container").innerHTML = `
        <div id="quiz">
            <div class="progressBox">
                <div class="progressBar">
                    <div id="progressFill"></div>
                </div>
                <div id="progressText"></div>
            </div>
            <div id="categoryName"></div>
            <div id="questionNumber"></div>
            <div id="question"></div>
            <div class="buttons">
                <button class="oBtn" onclick="checkAnswer(true)">⭕ O</button>
                <button class="xBtn" onclick="checkAnswer(false)">❌ X</button>
            </div>
            <div id="result"></div>
            <button id="nextBtn" onclick="nextQuestion()">다음 문제</button>
        </div>
    `;

    showQuestion();
}