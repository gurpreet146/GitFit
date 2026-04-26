let progressChart = null;

function showDashboardMessage(message, isError = false) {
  const box = document.getElementById("dashboardMessage");
  box.textContent = message;
  box.classList.remove("d-none", "alert-success", "alert-danger");
  box.classList.add(isError ? "alert-danger" : "alert-success");
}

function clearDashboardMessage() {
  const box = document.getElementById("dashboardMessage");
  box.classList.add("d-none");
  box.textContent = "";
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString();
}

function populateMuscleGroups() {
  const muscleSelect = document.getElementById("muscle_group");
  muscleSelect.innerHTML = "";

  Object.keys(EXERCISE_GROUPS).forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    muscleSelect.appendChild(option);
  });

  populateExercisesForGroup();
}

function populateExercisesForGroup() {
  const muscleSelect = document.getElementById("muscle_group");
  const exerciseSelect = document.getElementById("exercise_name");
  const selectedGroup = muscleSelect.value;
  const exercises = EXERCISE_GROUPS[selectedGroup] || [];

  exerciseSelect.innerHTML = "";
  exercises.forEach((exercise) => {
    const option = document.createElement("option");
    option.value = exercise;
    option.textContent = exercise;
    exerciseSelect.appendChild(option);
  });
}

function populateChartExerciseDropdown() {
  const select = document.getElementById("chart_exercise");
  select.innerHTML = "";

  ALL_EXERCISES.forEach((exercise) => {
    const option = document.createElement("option");
    option.value = exercise;
    option.textContent = exercise;
    select.appendChild(option);
  });
}

function computeExercisePrMap(workouts) {
  const prMap = {};
  workouts.forEach((workout) => {
    if (prMap[workout.exercise_name] === undefined || workout.weight > prMap[workout.exercise_name]) {
      prMap[workout.exercise_name] = workout.weight;
    }
  });
  return prMap;
}

function renderWorkoutTable(workouts) {
  const tableBody = document.getElementById("workoutsTableBody");
  tableBody.innerHTML = "";

  const prMap = computeExercisePrMap(workouts);

  workouts.forEach((workout) => {
    const row = document.createElement("tr");
    const isPr = workout.weight === prMap[workout.exercise_name];

    if (isPr) {
      row.classList.add("table-warning");
    }

    const exerciseCell = document.createElement("td");
    exerciseCell.textContent = workout.exercise_name;
    if (isPr) {
      const prLabel = document.createElement("span");
      prLabel.className = "pr-badge";
      prLabel.textContent = "🔥 PR";
      exerciseCell.appendChild(prLabel);
    }

    const muscleCell = document.createElement("td");
    muscleCell.textContent = workout.muscle_group;

    const setsCell = document.createElement("td");
    setsCell.textContent = String(workout.sets);

    const repsCell = document.createElement("td");
    repsCell.textContent = String(workout.reps);

    const weightCell = document.createElement("td");
    weightCell.textContent = String(workout.weight);

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(workout.date);

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-sm btn-outline-danger";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      deleteWorkout(workout.id).catch((error) => showDashboardMessage(error.message, true));
    });
    actionCell.appendChild(deleteButton);

    row.appendChild(exerciseCell);
    row.appendChild(muscleCell);
    row.appendChild(setsCell);
    row.appendChild(repsCell);
    row.appendChild(weightCell);
    row.appendChild(dateCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
}

async function loadWorkouts() {
  const workouts = await apiRequest("/workouts", {}, true);
  if (!workouts) {
    return;
  }
  renderWorkoutTable(workouts);
}

async function deleteWorkout(id) {
  const confirmed = window.confirm("Delete this workout?");
  if (!confirmed) {
    return;
  }

  await apiRequest(`/workouts/${id}`, { method: "DELETE" }, true);
  showDashboardMessage("Workout deleted");
  await loadWorkouts();
  await loadProgressChart();
}

async function handleAddWorkout(event) {
  event.preventDefault();
  clearDashboardMessage();

  const muscleGroup = document.getElementById("muscle_group").value;
  const exerciseName = document.getElementById("exercise_name").value;
  const sets = Number(document.getElementById("sets").value);
  const reps = Number(document.getElementById("reps").value);
  const weight = Number(document.getElementById("weight").value);

  if (!muscleGroup || !exerciseName) {
    showDashboardMessage("Select muscle group and exercise", true);
    return;
  }

  if (!Number.isFinite(sets) || sets <= 0 || !Number.isFinite(reps) || reps <= 0) {
    showDashboardMessage("Sets and reps must be greater than 0", true);
    return;
  }

  if (!Number.isFinite(weight) || weight < 0) {
    showDashboardMessage("Weight must be 0 or greater", true);
    return;
  }

  try {
    await apiRequest(
      "/workouts",
      {
        method: "POST",
        body: JSON.stringify({
          muscle_group: muscleGroup,
          exercise_name: exerciseName,
          sets,
          reps,
          weight,
        }),
      },
      true
    );

    showDashboardMessage("Workout added");
    document.getElementById("workoutForm").reset();
    populateMuscleGroups();
    await loadWorkouts();

    const chartSelect = document.getElementById("chart_exercise");
    chartSelect.value = exerciseName;
    await loadProgressChart();
  } catch (error) {
    showDashboardMessage(error.message, true);
  }
}

async function loadProgressChart() {
  const selectedExercise = document.getElementById("chart_exercise").value;
  if (!selectedExercise) {
    return;
  }

  const points = await apiRequest(`/workouts/${encodeURIComponent(selectedExercise)}`, {}, true);
  if (!points) {
    return;
  }

  const labels = points.map((point) => new Date(point.date).toLocaleDateString());
  const weights = points.map((point) => point.weight);

  const emptyText = document.getElementById("chartEmpty");
  emptyText.classList.toggle("d-none", points.length > 0);

  const context = document.getElementById("progressChart").getContext("2d");
  if (progressChart) {
    progressChart.destroy();
  }

  progressChart = new Chart(context, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `${selectedExercise} Weight`,
          data: weights,
          fill: false,
          borderColor: "#0f7a6c",
          tension: 0.2,
          pointBackgroundColor: "#ef7d32",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function initDashboardPage() {
  requireAuthPage();
  attachLogoutHandlers();

  populateMuscleGroups();
  populateChartExerciseDropdown();

  document.getElementById("muscle_group").addEventListener("change", populateExercisesForGroup);
  document.getElementById("workoutForm").addEventListener("submit", handleAddWorkout);
  document.getElementById("chart_exercise").addEventListener("change", () => {
    loadProgressChart().catch((error) => showDashboardMessage(error.message, true));
  });

  loadWorkouts().catch((error) => showDashboardMessage(error.message, true));
  loadProgressChart().catch((error) => showDashboardMessage(error.message, true));
}

document.addEventListener("DOMContentLoaded", initDashboardPage);
