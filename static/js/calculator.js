// ============================
// GARDE CALCULATION LOGIC
// ============================

// This function takes a score and returns the grade and grade point
function getGrade(score) {
    if (score >= 70) return { grade: 'A', point: 5.0 };
    if (score >= 60) return { grade: 'B', point: 4.0 };
    if (score >= 50) return { grade: 'C', point: 3.0 };
    if (score >= 45) return { grade: 'D', point: 2.0 };
    if (score >= 40) return { grade: 'E', point: 1.0 };
    return { grade: 'F', point: 0.0 }
}

// This function takes a CGPA and returns the class
function getClass(cgpa) {
    if (cgpa >= 4.50) return 'First Class';
    if (cgpa >= 3.50) return 'Second Class Upper';
    if (cgpa >= 2.40) return 'Second Class Lower';
    if (cgpa >= 1.50) return 'Third Class';
    if (cgpa >= 1.00) return 'Pass';
    return'Fail';
}

// ============================
// TAB SWITCHING
// ============================

// This function switches between the two tabs
function switchTab(tab) {
    // Hide all panels
    document.getElementById('panel-semester').style.display = 'none';
    document.getElementById('panel-target').style.display = 'none';

    // Remove active from all tabs
    document.getElementById('tab-semester').classList.remove('calc_tab--active');
    document.getElementById('tab-target').classList.remove('calc_tab--active');

    // Show selected panel and activate tab
    document.getElementById('panel-' + tab).style.display = "block";
    document.getElementById('tab-' + tab).classList.add('calc_tab--active');
}

// ===========================
// SEMESTER GP CALCULATOR
// ===========================

// Keeps track of how many courses have been added
let courseCount = 0;

// This function adds a new course row to the table
function addCourse() {
    courseCount++;
    const courseList = document.getElementById('course-list');

    const row = document.createElement('div');
    row.id = 'course-' + courseCount;
    row.className = 'calc_course-row';

    row.innerHTML = `
    <input type="text"
           placeholder="e.g MTH101"
           class="calc_course-input"
           style="background-color:#1a1a1a; color:#ffffff; border:1px solid #2a2a2a;">
    <input type="number"
           id="unit-${courseCount}"
           min="1" max="6"
           placeholder="e.g 3"
           class="calc_course-input"
           style="background-color:#1a1a1a; color:#ffffff; border:1px solid #2a2a2a;">
    <input type="number"
           id="score-${courseCount}"
           min="0" max="100"
           placeholder="e.g 75"
           oninput="updateGrade(${courseCount})"
           class="calc_course-input"
           style="background-color:#1a1a1a; color:#ffffff; border:1px solid #2a2a2a;">
    <span id="grade-${courseCount}" class="calc_grade-display">-</span>
    <span id="point-${courseCount}" class="calc_grade-display">-</span>
    <button type="button" onclick="removeCourse(${courseCount})" class="calc_remove-btn" style="color:#ff4444; background:none; border:1px solid #ff4444; border-radius:4px; padding:5px 10px; cursor:pointer;">✕</button>
`;

    courseList.appendChild(row);
}

function removeCourse(id) {
    const row = document.getElementById('course-' + id);
    if (row) row.remove();
}

// This function updates the grade display when a score is entered 
function updateGrade(id) {
    const score = parseFloat(document.getElementById('score-' + id).value);

    if (!isNaN(score)) {
        const result = getGrade(score);
        document.getElementById('grade-' + id).textContent = result.grade;
        document.getElementById('point-' + id).textContent = result.point.toFixed(1);
    } else {
        document.getElementById('grade-' + id).textContent = '-';
        document.getElementById('point-' + id).textContent = '-';
    }
}

// This function calculates the semester GP
function calculateSemesterGP() {
    const rows = document.querySelectorAll('.calc_course-row');

    if (rows.length === 0) {
        alert('Please add at least one course!');
        return;
    }

    let totalPoints = 0;
    let totalCredits = 0;
    let valid = true;

    rows.forEach(function(row) {
        const inputs = row.querySelectorAll('input[type="number"]');
        const unit = parseFloat(inputs[0].value);
        const score = parseFloat(inputs[1].value);

        if (isNaN(unit) || isNaN(score)) {
            valid = false;
            return;
        }

        const gradeResult = getGrade(score);
        totalPoints += unit * gradeResult.point;
        totalCredits += unit;
    });

    if (!valid) {
        alert('Please fill in all credit units and scores!');
        return;
    }

    const gp = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const classResult = getClass(gp);

    // Show results
    document.getElementById('semester-result').style.display = 'flex';
    document.getElementById('semester-gp').textContent = gp.toFixed(2);
    document.getElementById('total-credits').textContent = totalCredits;
    document.getElementById('semester-class').textContent = classResult;
}

// =================================
// TARGET CALCULATOR
// =================================

function calculateTarget() {
    // Get all input values
    const currentCGPA = parseFloat(document.getElementById('current-cgpa').value);
    const completedCredits = parseFloat(document.getElementById('completed-credits').value);
    const targetCGPA = parseFloat(document.getElementById('target-class').value);
    const remainingSemesters = parseFloat(document.getElementById('remaining-semesters').value);

    // Validate inputs
    if (isNaN(currentCGPA) || isNaN(completedCredits) ||
        isNaN(targetCGPA) || isNaN(remainingSemesters)) {
        alert('Please fill in all fields!');
        return;
    }

    // Get individual semester credits
    let remainingCredits = 0;
    let semesterCredits = [];

    for (let i = 1; i <= remainingSemesters; i++) {
        const credits = parseFloat(document.getElementById('sem-credits-' + i)?.value);
        if (isNaN(credits) || credits <= 0) {
            alert('Please enter credits for Semester ${i}!');
            return;
        }
        semesterCredits.push(credits);
        remainingCredits += credits;
    }

    const totalCredits = completedCredits + remainingCredits;
    const currentPoints = currentCGPA * completedCredits;
    const targetTotalPoints = targetCGPA * totalCredits;
    const pointsNeeded = targetTotalPoints - currentPoints
    const gpNeeded = pointsNeeded / remainingCredits;
    const targetClassName = getClass(targetCGPA);

    const resultDiv = document.getElementById('target-result');
    resultDiv.style.display = 'block';

    // Check if already in target class
    if (currentCGPA >= targetCGPA) {
        // Calculate maintenance GP
        const maintenanceGP = pointsNeeded / remainingCredits;

        resultDiv.innerHTML = `
            <div class="calc_target-item">
                <span class="calc_target-label">Current CGPA</span>
                <span class="calc_target-value">${currentCGPA.toFixed(2)}</span>
            </div>
            <div class="calc_target-item">
                <span class="calc_target-label">Target Class</span>
                <span class="calc_target-value">${targetClassName}</span>
            </div>
            <div class="calc_target-item">
                <span class="calc_target-label">Minimum GP to Maintain</span>
                <span class="calc_target-value">${maintenanceGP.toFixed(2)}</span>
            </div>
            <div class="calc_success">
                You are already in ${targetClassName}! Maintain a minimum GP of 
                ${maintenanceGP.toFixed(2)} per semester to stay there.
            </div>
        `;
        return;
    }

    // Check if target is impossible
    if (gpNeeded > 5.0) {
        // Calculate best possible CGPA
        const bestPoints = currentPoints + (5.0 * remainingCredits);
        const bestCGPA = bestPoints / totalCredits;
        const bestClass = getClass(bestCGPA);

        resultDiv.innerHTML = `
            <div class="calc_target-item">
                <span class="calc_target-label">Target Class</span>
                <span class="calc_target-value">${targetClassName}</span>
            </div>
            <div class="calc_target-item">
                <span class="calc_target-label">GP Required</span>
                <span class="calc_impossible">${gpNeeded.toFixed(2)} (Impossible)</span>
            </div>
            <div class="calc_target-item">
                <span class="calc_target-label">Best Possible CGPA</span>
                <span class="calc_target-value">${bestCGPA.toFixed(2)}</span>
            </div>
            <div class="calc_target-item">
                <span class="calc_target-label">Best Possible Class</span>
                <span class="calc_target-value">${bestClass}</span>
            </div>
            <div class="calc_warning">
                Reaching ${targetClassName} is impossible with your current records. 
                Even with a perfect 5.0 in all remaining semesters, 
                the best you can achieve is ${bestClass} with a CGPA of ${bestCGPA.toFixed(2)}.
            </div>
        `;
        return;
    }

    // Calculate GP needed per semester based on individual credits
    let semesterBreakdown = '';
    for (let i = 0; i < remainingSemesters; i++) {
        const semCredits = semesterCredits[i];
        const semPoints = (pointsNeeded / remainingCredits) * semCredits;
        const semGP = semPoints / semCredits;
        semesterBreakdown += `
            <div class="calc_target-item">
                <span class="calc_target-label">Semester ${i + 1} (${semCredits} credits)</span>
                <span class="calc_target-value">${semGP.toFixed(2)} GP needed</span>
            </div>    
        `;
    }
    const maintenanceGP = gpNeeded;

    // Show normal result
    resultDiv.innerHTML = `
        <div class="calc_target-item">
            <span class="calc_target-label">Target Class</span>
            <span class="calc_target-value">${targetClassName}</span>
        </div>
        <div class="calc_target-item">
            <span class="calc_target-label">Total Remaining Credits</span>
            <span class="calc_target-value">${remainingCredits}</span>
        </div>
        ${semesterBreakdown}
        <div class="calc_target-item">
            <span class="calc_target-label">Minimum GP to Maintain After Reaching Target</span>
            <span class="calc_target-value">${maintenanceGP.toFixed(2)}</span>
        </div>
        <div class="calc_success">
            Follow the semester breakdown above to reach ${targetClassName}.
            Once there, maintain a minimum of ${maintenanceGP.toFixed(2)} GP per semester.
        </div>
    `;
}

    // Generate Semester Fields
    function generateSemesterFields() {
        const remaining = parseInt(document.getElementById('remaining-semesters').value);

        if (isNaN(remaining)  || remaining <= 0) {
            alert('Please enter number of remaining semesters first!');
            return;
        }

        const container = document.getElementById('semester-credits-list');
        container.innerHTML = '';

        for (let i = 1; i <= remaining; i++) {
            const field = document.createElement('div');
            field.className = 'calc_field';
            field.innerHTML = `
                <label class="calc_label">Semester ${i} Credit Units</label>
                <input type="number" id="sem-credits-${i}" placeholder="e.g 18" class="calc_input">
        `;
        container.appendChild(field);
        }        
    }

function increaseValue(id) {
    const input = document.getElementById(id);
    input.value = parseInt(input.value || 0) + 1;
    if (id.includes('score')) {
        const num = id.split('-')[1];
        updateGrade(num);
    }
}

function decreaseValue(id) {
    const input = document.getElementById(id);
    const val = parseInt(input.value || 0) - 1;
    input.value = val < 0 ? 0 : val;
    if (id.includes('score')) {
        const num = id.split('-')[1];
        updateGrade(num);
    }
}

// Add first course automatically when page loads
window.onload = function() {
    addCourse();
}
