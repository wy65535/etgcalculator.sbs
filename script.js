// ETG Calculator - Advanced JavaScript Logic

// Constants
const ETG_HALF_LIFE = 2.5; // hours in blood
const ETG_PRODUCTION_RATE = 0.006; // ETG per gram of alcohol
const ALCOHOL_GRAMS_PER_DRINK = 14; // standard drink
const ALCOHOL_DENSITY = 0.789; // g/ml

// Metabolism rates (hours to eliminate ETG completely per gram of alcohol)
const METABOLISM_RATES = {
    slow: { multiplier: 1.3, label: 'Slow' },
    average: { multiplier: 1.0, label: 'Average' },
    fast: { multiplier: 0.8, label: 'Fast' }
};

// Gender metabolism adjustment
const GENDER_MULTIPLIER = {
    male: 1.0,
    female: 1.15 // females metabolize alcohol ~15% slower
};

// Drink types with ABV
const DRINK_TYPES = {
    beer: { abv: 5, name: 'Beer' },
    wine: { abv: 12, name: 'Wine' },
    liquor: { abv: 40, name: 'Liquor/Spirits' },
    custom: { abv: 0, name: 'Custom' }
};

let sessionCounter = 1;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    setupEventListeners();
    setDefaultDateTime();
});

function initializeCalculator() {
    // Set current date/time for first drinking session
    const now = new Date();
    now.setHours(now.getHours() - 24); // Default to 24 hours ago
    document.querySelector('.drinkTime').value = formatDateTime(now);
}

function setupEventListeners() {
    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', calculateETG);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetCalculator);
    
    // Add session button
    document.getElementById('addSession').addEventListener('click', addDrinkingSession);
    
    // Drink type change handlers
    document.querySelectorAll('.drinkType').forEach(select => {
        select.addEventListener('change', handleDrinkTypeChange);
    });
    
    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', toggleFAQ);
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function setDefaultDateTime() {
    const now = new Date();
    now.setHours(now.getHours() - 24);
    const firstSession = document.querySelector('.drinking-session .drinkTime');
    if (firstSession) {
        firstSession.value = formatDateTime(now);
    }
}

function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function addDrinkingSession() {
    sessionCounter++;
    const sessionsContainer = document.getElementById('drinkingSessions');
    
    const sessionHTML = `
        <div class="drinking-session" data-session="${sessionCounter}">
            <h4>Session #${sessionCounter}</h4>
            
            <div class="form-group">
                <label>Drink Type</label>
                <select class="drinkType">
                    <option value="beer">Beer (5% ABV)</option>
                    <option value="wine">Wine (12% ABV)</option>
                    <option value="liquor">Liquor/Spirits (40% ABV)</option>
                    <option value="custom">Custom</option>
                </select>
            </div>

            <div class="form-group custom-abv" style="display: none;">
                <label>Custom Alcohol By Volume (ABV %)</label>
                <input type="number" class="customABV" placeholder="e.g., 8.5" min="0" max="100" step="0.1">
            </div>

            <div class="form-group">
                <label>Amount Consumed</label>
                <div class="input-group">
                    <input type="number" class="drinkAmount" placeholder="Amount" min="0" step="0.1" value="3">
                    <select class="drinkUnit">
                        <option value="ml">ml</option>
                        <option value="oz">oz</option>
                        <option value="drinks" selected>Standard Drinks</option>
                    </select>
                </div>
                <small>1 standard drink ≈ 14g of pure alcohol</small>
            </div>

            <div class="form-group">
                <label>When did you drink?</label>
                <input type="datetime-local" class="drinkTime" required>
            </div>

            <div class="form-group">
                <label>Drinking Duration</label>
                <div class="input-group">
                    <input type="number" class="drinkDuration" placeholder="Duration" min="0.5" step="0.5" value="2">
                    <select class="durationUnit">
                        <option value="hours" selected>Hours</option>
                        <option value="minutes">Minutes</option>
                    </select>
                </div>
            </div>

            <button type="button" class="btn-remove-session">Remove Session</button>
        </div>
    `;
    
    sessionsContainer.insertAdjacentHTML('beforeend', sessionHTML);
    
    // Add event listeners to new session
    const newSession = sessionsContainer.lastElementChild;
    newSession.querySelector('.drinkType').addEventListener('change', handleDrinkTypeChange);
    newSession.querySelector('.btn-remove-session').addEventListener('click', function() {
        removeDrinkingSession(newSession);
    });
    
    // Set default time for new session
    const now = new Date();
    now.setHours(now.getHours() - 12);
    newSession.querySelector('.drinkTime').value = formatDateTime(now);
    
    // Show remove buttons on all sessions if more than one
    updateRemoveButtons();
}

function removeDrinkingSession(sessionElement) {
    sessionElement.remove();
    updateRemoveButtons();
    renumberSessions();
}

function updateRemoveButtons() {
    const sessions = document.querySelectorAll('.drinking-session');
    sessions.forEach((session, index) => {
        const removeBtn = session.querySelector('.btn-remove-session');
        if (sessions.length > 1) {
            removeBtn.style.display = 'block';
        } else {
            removeBtn.style.display = 'none';
        }
    });
}

function renumberSessions() {
    const sessions = document.querySelectorAll('.drinking-session');
    sessions.forEach((session, index) => {
        session.setAttribute('data-session', index + 1);
        session.querySelector('h4').textContent = `Session #${index + 1}`;
    });
    sessionCounter = sessions.length;
}

function handleDrinkTypeChange(e) {
    const session = e.target.closest('.drinking-session');
    const customABVGroup = session.querySelector('.custom-abv');
    
    if (e.target.value === 'custom') {
        customABVGroup.style.display = 'block';
    } else {
        customABVGroup.style.display = 'none';
    }
}

function toggleFAQ(e) {
    const faqItem = e.target.closest('.faq-item');
    faqItem.classList.toggle('active');
}

function calculateETG() {
    try {
        // Get personal information
        const weight = parseFloat(document.getElementById('weight').value);
        const weightUnit = document.getElementById('weightUnit').value;
        const gender = document.getElementById('gender').value;
        const metabolismRate = document.getElementById('metabolismRate').value;
        const testThreshold = parseInt(document.getElementById('testThreshold').value);
        const testDateInput = document.getElementById('testDate').value;
        
        // Validate inputs
        if (!weight || weight <= 0) {
            alert('Please enter a valid body weight');
            return;
        }
        
        // Convert weight to kg
        const weightKg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
        
        // Get all drinking sessions
        const sessions = document.querySelectorAll('.drinking-session');
        const drinkingSessions = [];
        
        sessions.forEach(session => {
            const drinkType = session.querySelector('.drinkType').value;
            const customABV = parseFloat(session.querySelector('.customABV').value) || 0;
            const drinkAmount = parseFloat(session.querySelector('.drinkAmount').value);
            const drinkUnit = session.querySelector('.drinkUnit').value;
            const drinkTime = session.querySelector('.drinkTime').value;
            const drinkDuration = parseFloat(session.querySelector('.drinkDuration').value);
            const durationUnit = session.querySelector('.durationUnit').value;
            
            if (!drinkTime || !drinkAmount || drinkAmount <= 0) {
                return; // Skip invalid sessions
            }
            
            // Get ABV
            let abv;
            if (drinkType === 'custom') {
                abv = customABV;
                if (!abv || abv <= 0) {
                    alert('Please enter a valid custom ABV');
                    throw new Error('Invalid custom ABV');
                }
            } else {
                abv = DRINK_TYPES[drinkType].abv;
            }
            
            // Calculate total alcohol in grams
            let totalAlcoholGrams;
            if (drinkUnit === 'drinks') {
                totalAlcoholGrams = drinkAmount * ALCOHOL_GRAMS_PER_DRINK;
            } else if (drinkUnit === 'ml') {
                totalAlcoholGrams = drinkAmount * (abv / 100) * ALCOHOL_DENSITY;
            } else if (drinkUnit === 'oz') {
                const ml = drinkAmount * 29.5735;
                totalAlcoholGrams = ml * (abv / 100) * ALCOHOL_DENSITY;
            }
            
            // Convert duration to hours
            const durationHours = durationUnit === 'hours' ? drinkDuration : drinkDuration / 60;
            
            drinkingSessions.push({
                time: new Date(drinkTime),
                alcoholGrams: totalAlcoholGrams,
                durationHours: durationHours,
                abv: abv
            });
        });
        
        if (drinkingSessions.length === 0) {
            alert('Please add at least one drinking session with valid data');
            return;
        }
        
        // Sort sessions by time
        drinkingSessions.sort((a, b) => a.time - b.time);
        
        // Calculate total alcohol consumed
        const totalAlcohol = drinkingSessions.reduce((sum, session) => sum + session.alcoholGrams, 0);
        
        // Calculate ETG levels
        const results = calculateETGLevels(
            drinkingSessions,
            weightKg,
            gender,
            metabolismRate,
            testThreshold
        );
        
        // Display results
        displayResults(results, totalAlcohol, testThreshold, testDateInput);
        
        // Scroll to results
        document.getElementById('resultsContainer').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Calculation error:', error);
        alert('An error occurred during calculation. Please check your inputs.');
    }
}

function calculateETGLevels(sessions, weightKg, gender, metabolismRate, testThreshold) {
    const now = new Date();
    
    // Calculate total alcohol and peak ETG
    const totalAlcoholGrams = sessions.reduce((sum, s) => sum + s.alcoholGrams, 0);
    
    // Estimate peak ETG level (ng/mL)
    // Peak ETG is roughly 25-50 ng/mL per gram of ethanol consumed
    const peakETGPerGram = 35; // conservative average
    const estimatedPeakETG = totalAlcoholGrams * peakETGPerGram;
    
    // Find the last drinking time
    const lastSession = sessions[sessions.length - 1];
    const lastDrinkTime = new Date(lastSession.time);
    lastDrinkTime.setHours(lastDrinkTime.getHours() + lastSession.durationHours);
    
    // Calculate hours since last drink
    const hoursSinceLastDrink = (now - lastDrinkTime) / (1000 * 60 * 60);
    
    // Apply metabolism adjustments
    const genderMultiplier = GENDER_MULTIPLIER[gender];
    const metabMultiplier = METABOLISM_RATES[metabolismRate].multiplier;
    
    // ETG elimination rate (varies, but approximately 20-30% per hour after peak)
    // This is a simplified model
    const baseEliminationRate = 0.25; // 25% per hour
    const adjustedEliminationRate = baseEliminationRate / (genderMultiplier * metabMultiplier);
    
    // Calculate current ETG level
    let currentETG = estimatedPeakETG;
    
    // Peak occurs around 5 hours after last drink
    const hoursToPeak = 5;
    
    if (hoursSinceLastDrink < hoursToPeak) {
        // Still rising or at peak
        currentETG = estimatedPeakETG * (hoursSinceLastDrink / hoursToPeak);
    } else {
        // Declining phase
        const hoursAfterPeak = hoursSinceLastDrink - hoursToPeak;
        currentETG = estimatedPeakETG * Math.pow((1 - adjustedEliminationRate), hoursAfterPeak);
    }
    
    currentETG = Math.max(0, currentETG);
    
    // Calculate hours until below threshold
    let hoursUntilSafe = 0;
    if (currentETG > testThreshold) {
        // Calculate remaining elimination time
        hoursUntilSafe = Math.log(testThreshold / currentETG) / Math.log(1 - adjustedEliminationRate);
        if (hoursSinceLastDrink < hoursToPeak) {
            hoursUntilSafe += (hoursToPeak - hoursSinceLastDrink);
        }
    }
    
    // Calculate total elimination time (until ETG < 100 ng/mL, which is effective zero)
    const minimumThreshold = 100;
    let totalEliminationHours = hoursToPeak;
    if (estimatedPeakETG > minimumThreshold) {
        totalEliminationHours += Math.log(minimumThreshold / estimatedPeakETG) / Math.log(1 - adjustedEliminationRate);
    }
    
    // Calculate safe time
    const safeTime = new Date(lastDrinkTime);
    safeTime.setHours(safeTime.getHours() + hoursUntilSafe);
    
    return {
        peakETG: Math.round(estimatedPeakETG),
        currentETG: Math.round(currentETG),
        hoursUntilSafe: Math.max(0, hoursUntilSafe),
        safeTime: safeTime,
        totalEliminationHours: totalEliminationHours,
        lastDrinkTime: lastDrinkTime,
        hoursSinceLastDrink: hoursSinceLastDrink
    };
}

function displayResults(results, totalAlcohol, testThreshold, testDateInput) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'block';
    resultsContainer.classList.add('fade-in');
    
    // Total alcohol consumed
    const totalDrinks = (totalAlcohol / ALCOHOL_GRAMS_PER_DRINK).toFixed(1);
    document.getElementById('totalAlcohol').textContent = 
        `${totalAlcohol.toFixed(1)}g (${totalDrinks} standard drinks)`;
    
    // Peak ETG level
    document.getElementById('peakETG').textContent = 
        `${results.peakETG.toLocaleString()} ng/mL`;
    
    // Current ETG level
    const currentETGElement = document.getElementById('currentETG');
    currentETGElement.textContent = `${results.currentETG.toLocaleString()} ng/mL`;
    
    // Color code current ETG
    const currentCard = currentETGElement.closest('.result-card');
    if (results.currentETG < testThreshold) {
        currentCard.style.borderLeftColor = '#10b981';
        currentETGElement.style.color = '#10b981';
    } else if (results.currentETG < testThreshold * 1.5) {
        currentCard.style.borderLeftColor = '#f59e0b';
        currentETGElement.style.color = '#f59e0b';
    } else {
        currentCard.style.borderLeftColor = '#ef4444';
        currentETGElement.style.color = '#ef4444';
    }
    
    // Elimination time
    const eliminationTimeElement = document.getElementById('eliminationTime');
    if (results.hoursUntilSafe <= 0) {
        eliminationTimeElement.innerHTML = 
            `<span style="color: #10b981;">You should be safe now!</span><br>` +
            `<small>ETG level is below ${testThreshold} ng/mL threshold</small>`;
    } else {
        const days = Math.floor(results.hoursUntilSafe / 24);
        const hours = Math.floor(results.hoursUntilSafe % 24);
        const minutes = Math.round((results.hoursUntilSafe % 1) * 60);
        
        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0) timeString += `${hours}h `;
        if (minutes > 0 && days === 0) timeString += `${minutes}m`;
        
        eliminationTimeElement.innerHTML = 
            `${timeString.trim()}<br>` +
            `<small>Safe after: ${results.safeTime.toLocaleString()}</small>`;
    }
    
    // Test prediction
    if (testDateInput) {
        const testDate = new Date(testDateInput);
        const testCard = document.getElementById('testResultCard');
        testCard.style.display = 'block';
        
        const testPrediction = document.getElementById('testPrediction');
        
        if (testDate > results.safeTime) {
            testPrediction.innerHTML = 
                `<span style="color: #10b981;">✓ Likely PASS</span><br>` +
                `<small>ETG should be below ${testThreshold} ng/mL by test time</small>`;
            testCard.style.borderLeftColor = '#10b981';
        } else {
            const hoursUntilTest = (testDate - new Date()) / (1000 * 60 * 60);
            const estimatedTestETG = results.currentETG * Math.pow(0.75, Math.max(0, hoursUntilTest));
            
            testPrediction.innerHTML = 
                `<span style="color: #ef4444;">✗ Likely FAIL</span><br>` +
                `<small>Estimated ETG at test: ${Math.round(estimatedTestETG)} ng/mL<br>` +
                `Test threshold: ${testThreshold} ng/mL</small>`;
            testCard.style.borderLeftColor = '#ef4444';
        }
    } else {
        document.getElementById('testResultCard').style.display = 'none';
    }
    
    // Draw timeline
    drawTimeline(results, testThreshold);
}

function drawTimeline(results, testThreshold) {
    const timeline = document.getElementById('timelineChart');
    timeline.innerHTML = '';
    
    const now = new Date();
    const totalHours = Math.max(results.totalEliminationHours, results.hoursUntilSafe + 24);
    
    // Calculate key time points
    const hoursSinceLastDrink = results.hoursSinceLastDrink;
    const hoursUntilSafe = results.hoursUntilSafe;
    
    // Create timeline bars
    const timelineData = [
        {
            label: 'Passed',
            hours: Math.max(0, hoursSinceLastDrink),
            color: '#94a3b8',
            percentage: (hoursSinceLastDrink / totalHours) * 100
        },
        {
            label: 'Time Until Safe',
            hours: Math.max(0, hoursUntilSafe),
            color: results.currentETG > testThreshold ? '#ef4444' : '#10b981',
            percentage: (hoursUntilSafe / totalHours) * 100
        }
    ];
    
    let cumulativePercentage = 0;
    
    timelineData.forEach(data => {
        if (data.percentage > 0) {
            const bar = document.createElement('div');
            bar.className = 'timeline-bar';
            bar.style.left = `${cumulativePercentage}%`;
            bar.style.width = `${data.percentage}%`;
            bar.style.background = data.color;
            
            const days = Math.floor(data.hours / 24);
            const hours = Math.floor(data.hours % 24);
            let timeText = '';
            if (days > 0) timeText += `${days}d `;
            timeText += `${hours}h`;
            
            bar.innerHTML = `<span>${data.label}: ${timeText}</span>`;
            timeline.appendChild(bar);
            
            cumulativePercentage += data.percentage;
        }
    });
    
    // Add current time marker
    const marker = document.createElement('div');
    marker.style.position = 'absolute';
    marker.style.left = `${(hoursSinceLastDrink / totalHours) * 100}%`;
    marker.style.top = '0';
    marker.style.bottom = '0';
    marker.style.width = '3px';
    marker.style.background = '#1f2937';
    marker.style.zIndex = '10';
    marker.title = 'Current Time';
    timeline.appendChild(marker);
}

function resetCalculator() {
    // Reset form
    document.getElementById('weight').value = '70';
    document.getElementById('weightUnit').value = 'kg';
    document.getElementById('gender').value = 'male';
    document.getElementById('metabolismRate').value = 'average';
    document.getElementById('testThreshold').value = '500';
    document.getElementById('testDate').value = '';
    
    // Remove all sessions except first
    const sessions = document.querySelectorAll('.drinking-session');
    sessions.forEach((session, index) => {
        if (index > 0) session.remove();
    });
    
    sessionCounter = 1;
    
    // Reset first session
    const firstSession = document.querySelector('.drinking-session');
    firstSession.querySelector('.drinkType').value = 'beer';
    firstSession.querySelector('.drinkAmount').value = '3';
    firstSession.querySelector('.drinkUnit').value = 'drinks';
    firstSession.querySelector('.drinkDuration').value = '2';
    firstSession.querySelector('.durationUnit').value = 'hours';
    firstSession.querySelector('.custom-abv').style.display = 'none';
    
    setDefaultDateTime();
    updateRemoveButtons();
    
    // Hide results
    document.getElementById('resultsContainer').style.display = 'none';
    
    // Scroll to top of calculator
    document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
}

// Utility function to format dates
function formatDate(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
