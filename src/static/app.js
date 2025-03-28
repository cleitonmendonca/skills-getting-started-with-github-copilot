document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear existing options in the dropdown
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate the dropdown with activity options
      Object.keys(activities).forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Participants:</strong></p>
          <ul class="participants-list">
            ${details.participants
              .map(
                (participant) => `
                  <li>
                    ${participant}
                    <button class="delete-btn" data-activity="${name}" data-email="${participant}">❌</button>
                  </li>
                `
              )
              .join("")}
          </ul>
        `;

        activitiesList.appendChild(activityCard);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const activityName = button.getAttribute("data-activity");
          const email = button.getAttribute("data-email");

          const confirmation = confirm(`Are you sure you want to remove ${email} from ${activityName}?`);
          if (!confirmation) return;

          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`,
              {
                method: "POST",
              }
            );

            if (response.ok) {
              fetchActivities(); // Refresh the activities list
            } else {
              const result = await response.json();
              alert(result.detail || "An error occurred while unregistering.");
            }
          } catch (error) {
            console.error("Error unregistering participant:", error);
            alert("Failed to unregister. Please try again.");
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Function to unregister a participant
  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        alert(`${email} has been removed from ${activityName}`);
        fetchActivities(); // Refresh the activities list
      } else {
        const result = await response.json();
        alert(result.detail || "An error occurred while unregistering.");
      }
    } catch (error) {
      console.error("Error unregistering participant:", error);
      alert("Failed to unregister. Please try again.");
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh the activities list after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
