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

  document.querySelector(".oBtn").style.opacity=".6";
document.querySelector(".xBtn").style.opacity=".6";

if(q.answer){

    document.querySelector(".oBtn").style.background="#198754";

}else{

    document.querySelector(".xBtn").style.background="#dc3545";

}
    // 이미 답을 눌렀으면 무시
    if(document.querySelector(".oBtn").disabled){
        return;
    }

    const q = questions[current];

    // 버튼 비활성화
    document.querySelector(".oBtn").disabled = true;
    document.querySelector(".xBtn").disabled = true;

    if(userAnswer === q.answer){

        score++;

        document.getElementById("result").innerHTML =
        "✅ 정답입니다!";

    }else{

        document.getElementById("result").innerHTML =
        "❌ 오답입니다.";

        wrongQuestions.push({

            number: current + 1,

            category: q.category,

            question: q.question,

            correct: q.answer,

            user: userAnswer,

            description: q.description

        });

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

        <button onclick="showWrongNote()">
            📖 오답노트 보기
        </button>

        <br><br>

        <button onclick="location.reload()">
            🔄 처음부터 다시
        </button>

    `;

}

function retryWrongQuestions(){

    questions = wrongQuestions.map(item=>{

        return{

            number:item.number,

            category:item.category,

            question:item.question,

            answer:item.correct,

            description:item.description

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

<button id="nextBtn" onclick="nextQuestion()">

다음 문제

</button>

</div>
`;

    showQuestion();

}

