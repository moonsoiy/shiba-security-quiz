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

    const savedName = localStorage.getItem("username");

if(savedName){

    document.getElementById("username").value = savedName;

}

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

    const categories = [...new Set(

        allQuestions.map(q => q.category)

    )];

    categories.forEach(category=>{

        const option=document.createElement("option");

        option.value=category;

        option.textContent=category;

        select.appendChild(option);

    });

}


// ==============================
// 퀴즈 시작
// ==============================

function startQuiz(){

    username=document.getElementById("username").value.trim();
    localStorage.setItem("username", username);

    if(username===""){

        alert("이름을 입력해주세요.");

        return;

    }

    const selectedCategory=

    document.getElementById("category").value;
    localStorage.setItem("category", selectedCategory);

    if(selectedCategory==="전체"){

        questions=[...allQuestions];
        questions.sort(() => Math.random() - 0.5);
    }else{

        questions=

        allQuestions.filter(q=>

            q.category===selectedCategory

        );

    }

    current=0;

    score=0;

    wrongQuestions=[];

    document.getElementById("start").style.display="none";

    document.getElementById("quiz").style.display="block";

    showQuestion();

}


// ==============================
// 문제 출력
// ==============================

function showQuestion(){

    const q=questions[current];

    document.getElementById("categoryName").innerText=

    `📂 ${q.category}`;

    document.getElementById("questionNumber").innerText =
    `${q.number}번 문제`;

    document.getElementById("question").innerText=

    q.question;

    const percent=

    ((current+1)/questions.length)*100;

    document.getElementById("progressFill").style.width=

    percent+"%";

    document.getElementById("progressText").innerText=

    `${current+1} / ${questions.length}`;

    document.getElementById("result").innerHTML="";

    document.getElementById("nextBtn").style.display="none";
    
    // 버튼 활성화
    document.querySelector(".oBtn").disabled = false;
    document.querySelector(".xBtn").disabled = false;

    document.querySelector(".oBtn").style.background="#28a745";
document.querySelector(".xBtn").style.background="#dc3545";

document.querySelector(".oBtn").style.opacity="1";
document.querySelector(".xBtn").style.opacity="1";
}

// ==============================
// 정답 확인
// ==============================


function checkAnswer(userAnswer){
    const oBtn = document.querySelector(".oBtn");
    const xBtn = document.querySelector(".xBtn");

    // 이미 클릭해서 비활성화 상태라면 중복 실행 방지
    if(oBtn.disabled){
        return;
    }

    const q = questions[current];

    // 버튼 비활성화 및 투명도 조절
    oBtn.disabled = true;
    xBtn.disabled = true;

    oBtn.style.opacity = ".6";
    xBtn.style.opacity = ".6";

    // 정답인 버튼 색상 강조
    if(q.answer){
        oBtn.style.background = "#198754";
    } else {
        xBtn.style.background = "#198754";
    }

    // 정/오답 판정 및 오답 데이터 저장
    if(userAnswer === q.answer){
        score++;
        document.getElementById("result").innerHTML = "✅ 정답입니다!";
    } else {
        document.getElementById("result").innerHTML = "❌ 오답입니다.";

        wrongQuestions.push({
            number: q.number,
            category: q.category,
            question: q.question,
            correct: q.answer,
            user: userAnswer,
            description: q.description
        });
    }

    // ⭐ 다음 버튼을 화면에 표시!
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

    let html = `
        <h1>🎉 퀴즈 종료</h1>
        <h2>${username}님의 결과</h2>
        <h2>${score} / ${questions.length}점</h2>
        <h3>정답률 : ${percent}%</h3>
        <br>
    `;

    if (wrongQuestions.length > 0) {
        html += `
            <button onclick="showWrongNote()" style="width:100%; height:55px; background:#0d6efd; color:white; font-size:18px; border-radius:10px; margin-bottom:12px;">
                📖 오답노트 보기 (${wrongQuestions.length}문제)
            </button>
            <br>
        `;
    } else {
        html += `<p style="color:#28a745; font-weight:bold; font-size:20px; margin-bottom:20px;">👏 만점입니다! 틀린 문제가 없습니다.</p>`;
    }

    html += `
        <button onclick="location.reload()" style="width:100%; height:55px; background:#6c757d; color:white; font-size:18px; border-radius:10px;">
            🔄 처음부터 다시
        </button>
    `;

    document.querySelector(".container").innerHTML = html;
}


// ==============================
// 오답노트 보기 (문제 번호 및 틀린 목록)
// ==============================

function showWrongNote(){
    let wrongHtml = `
        <h1>📖 오답노트</h1>
        <p style="text-align:center; color:#6c757d; margin-bottom:20px;">총 ${wrongQuestions.length}문제를 틀렸습니다.</p>
    `;

    wrongQuestions.forEach((item) => {
        wrongHtml += `
            <div class="wrongCard">
                <h3>📌 ${item.number}번 문제 [${item.category}]</h3>
                <p style="font-size:1.1rem; font-weight:bold; margin: 10px 0;">${item.question}</p>
                <p>❌ <strong>내 답:</strong> ${item.user ? "⭕ O" : "❌ X"}</p>
                <p>✅ <strong>정답:</strong> ${item.correct ? "⭕ O" : "❌ X"}</p>
            </div>
        `;
    });

    wrongHtml += `
        <br>
        <button onclick="retryWrongQuestions()" style="width:100%; height:55px; background:#28a745; color:white; font-size:18px; border-radius:10px; margin-bottom:10px;">
            ✏️ 틀린 문제만 다시 풀기
        </button>
        <button onclick="location.reload()" style="width:100%; height:55px; background:#6c757d; color:white; font-size:18px; border-radius:10px;">
            🔄 처음부터 다시
        </button>
    `;

    document.querySelector(".container").innerHTML = wrongHtml;
}


// ==============================
// 틀린 문제만 다시 풀기
// ==============================

function retryWrongQuestions(){
    questions = wrongQuestions.map(item => {
        return {
            number: item.number,
            category: item.category,
            question: item.question,
            answer: item.correct,
            description: item.description
        };
    });

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

            <button id="nextBtn" onclick="nextQuestion()">다음 문제 ➜</button>
        </div>
    `;

    showQuestion();
}

