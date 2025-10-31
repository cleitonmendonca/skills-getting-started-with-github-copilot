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
          <div class="participants-list">
            <h5>Current Participants:</h5>
            <div>
              ${details.participants.length > 0 
                ? details.participants.map(email => `
                    <span class="participant-item" style="display: inline-flex; align-items: center; margin-right: 10px; margin-bottom: 6px; background: #f1f1f1; border-radius: 16px; padding: 4px 10px;">
                      <span style="color: #666; font-size: 0.95em; margin-right: 6px;">${email}</span>
                      <span class="delete-participant" data-activity="${name}" data-email="${email}" style="cursor: pointer; color: #c62828; font-size: 1.2em; margin-left: 2px;" title="Remove">&#10006;</span>
                    </span>
                  `).join('')
                : '<span style="color: #999;">No participants yet</span>'
              }
            </div>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add event listeners for delete icons
        setTimeout(() => {
          activityCard.querySelectorAll('.delete-participant').forEach(icon => {
            icon.addEventListener('click', async (e) => {
              const activity = icon.getAttribute('data-activity');
              const email = icon.getAttribute('data-email');
              try {
                const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
                  method: "POST"
                });
                const result = await response.json();
                if (response.ok) {
                  messageDiv.textContent = result.message;
                  messageDiv.className = "success";
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || "An error occurred";
                  messageDiv.className = "error";
                }
                messageDiv.classList.remove("hidden");
                setTimeout(() => {
                  messageDiv.classList.add("hidden");
                }, 4000);
              } catch (error) {
                messageDiv.textContent = "Failed to remove participant. Please try again.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
              }
            });
          });
        }, 0);
        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
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
        fetchActivities(); // Refresh activities list after signup
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
