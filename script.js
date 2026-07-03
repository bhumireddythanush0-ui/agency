/* ================================
   NEXTGEN FOUNDERS - SCRIPT PART 1
   Setup + Helpers + Validation
================================ */

const pitchForm = document.querySelector(".pitch-form");
const investorSection = document.getElementById("investorSection");
const investorButtons = document.querySelectorAll(".investor-card button");
const adminBox = document.getElementById("adminRequests");

/* Hide investor section first */
if (investorSection) {
  investorSection.style.display = "none";
}

/* Show investor section only if pitch deck was already submitted */
if (localStorage.getItem("pitchDeckSubmitted") === "true") {
  investorSection.style.display = "block";
}

/* Change investor button text to Connect */
investorButtons.forEach((button) => {
  button.textContent = "Connect →";
});

/* Clear old form errors */
function clearErrors() {
  document.querySelectorAll(".error").forEach((error) => {
    error.remove();
  });

  document.querySelectorAll(".input-error").forEach((field) => {
    field.classList.remove("input-error");
  });
}

/* Show red error below field */
function showError(field, message) {
  if (!field) return;

  field.classList.add("input-error");

  const error = document.createElement("small");
  error.className = "error";
  error.innerText = message;

  field.insertAdjacentElement("afterend", error);
}

/* Show red error inside upload box */
function showUploadError(uploadBox, message) {
  if (!uploadBox) return;

  uploadBox.classList.add("input-error");

  if (!uploadBox.querySelector(".error")) {
    const error = document.createElement("small");
    error.className = "error";
    error.innerText = message;
    uploadBox.appendChild(error);
  }
}

/* Email validation */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Phone validation - Indian 10 digit number */
function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(phone);
}

/* Safe localStorage JSON read */
function getStoredArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

/* Safe localStorage object read */
function getStoredObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch (error) {
    return null;
  }
}
/* ================================
   NEXTGEN FOUNDERS - SCRIPT PART 2
   Pitch Deck Form Submit Logic
================================ */

if (pitchForm) {
  pitchForm.addEventListener("submit", function (e) {
    e.preventDefault();

    clearErrors();

    let valid = true;

    const founderName = pitchForm.querySelector('input[placeholder="Founder Name"]');
    const startupName = pitchForm.querySelector('input[placeholder="Startup Name"]');
    const email = pitchForm.querySelector('input[placeholder="Email Address"]');
    const phone = pitchForm.querySelector('input[placeholder="Phone Number"]');
    const selects = pitchForm.querySelectorAll("select");
    const stage = selects[0];
    const industry = selects[1];
    const description = pitchForm.querySelector("textarea");
    const fileInput = document.getElementById("pitchFile");
    const uploadBox = document.querySelector(".upload-box");

    if (!founderName || founderName.value.trim() === "") {
      valid = false;
      showError(founderName, "Founder name is required.");
    }

    if (!startupName || startupName.value.trim() === "") {
      valid = false;
      showError(startupName, "Startup name is required.");
    }

    if (!email || email.value.trim() === "") {
      valid = false;
      showError(email, "Email address is required.");
    } else if (!isValidEmail(email.value.trim())) {
      valid = false;
      showError(email, "Enter a valid email address.");
    }

    if (!phone || phone.value.trim() === "") {
      valid = false;
      showError(phone, "Phone number is required.");
    } else if (!isValidPhone(phone.value.trim())) {
      valid = false;
      showError(phone, "Enter a valid 10-digit phone number.");
    }

    if (!stage || stage.value === "" || stage.value === "Startup Stage") {
      valid = false;
      showError(stage, "Please select your startup stage.");
    }

    if (!industry || industry.value === "" || industry.value === "Industry") {
      valid = false;
      showError(industry, "Please select your industry.");
    }

    if (!fileInput || fileInput.files.length === 0) {
      valid = false;
      showUploadError(uploadBox, "Please upload your Pitch Deck PDF.");
    } else {
      const fileName = fileInput.files[0].name.toLowerCase();

      if (!fileName.endsWith(".pdf")) {
        valid = false;
        showUploadError(uploadBox, "Only PDF files are allowed.");
      }
    }

    if (!description || description.value.trim() === "") {
      valid = false;
      showError(description, "Startup description is required.");
    }

    if (!valid) {
      const firstError = document.querySelector(".input-error");

      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

      return;
    }

    const founderData = {
      founderName: founderName.value.trim(),
      startupName: startupName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      stage: stage.value,
      industry: industry.value,
      pitchDeckFile: fileInput.files[0].name,
      description: description.value.trim(),
      submittedAt: new Date().toLocaleString()
    };

    localStorage.setItem("pitchDeckSubmitted", "true");
    localStorage.setItem("founderData", JSON.stringify(founderData));

    if (investorSection) {
      investorSection.style.display = "block";
      investorSection.scrollIntoView({
        behavior: "smooth"
      });
    }

    alert("Pitch deck submitted successfully. Investor section unlocked.");
  });
}
/* ================================
   NEXTGEN FOUNDERS - SCRIPT PART 3
   Investor Connect Logic
================================ */

investorButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const founderData = getStoredObject("founderData");

    if (!founderData) {
      alert("Please submit your pitch deck first.");
      return;
    }

    const card = button.closest(".investor-card");

    if (!card) return;

    const investorName = card.querySelector("h3")?.textContent || "Investor";
    const investorRole = card.querySelector("p")?.textContent || "-";
    const investorCompany = card.querySelector("small")?.textContent || "-";
    const ticketSize = card.querySelector(".ticket")?.textContent || "-";

    const investorData = {
      investorName,
      investorRole,
      investorCompany,
      ticketSize,
      founder: founderData,
      requestedAt: new Date().toLocaleString(),
      status: "Interested"
    };

    let requests = getStoredArray("adminInvestorRequests");

    const alreadyRequested = requests.some(
      (req) =>
        req.investorName === investorData.investorName &&
        req.founder?.email === founderData.email
    );

    if (alreadyRequested) {
      alert("You already requested this investor.");
      button.textContent = "Requested ✓";
      button.disabled = true;
      return;
    }

    requests.push(investorData);

    localStorage.setItem("adminInvestorRequests", JSON.stringify(requests));

    button.textContent = "Requested ✓";
    button.disabled = true;

    if (typeof loadAdminRequests === "function") {
      loadAdminRequests();
    }

    alert("Connection request sent to admin dashboard.");
  });
});
/* ================================
   NEXTGEN FOUNDERS - SCRIPT PART 4
   Admin Dashboard + Reset Utility
================================ */

function loadAdminRequests() {
  if (!adminBox) return;

  const requests = getStoredArray("adminInvestorRequests");

  if (requests.length === 0) {
    adminBox.innerHTML = "<p>No investor requests yet.</p>";
    return;
  }

  adminBox.innerHTML = requests
    .map(
      (req) => `
      <div class="admin-card">
        <h3>${req.founder?.startupName || "Startup"} wants to connect with ${req.investorName}</h3>

        <p><b>Founder:</b> ${req.founder?.founderName || "-"}</p>
        <p><b>Email:</b> ${req.founder?.email || "-"}</p>
        <p><b>Phone:</b> ${req.founder?.phone || "-"}</p>
        <p><b>Stage:</b> ${req.founder?.stage || "-"}</p>
        <p><b>Industry:</b> ${req.founder?.industry || "-"}</p>
        <p><b>Pitch Deck:</b> ${req.founder?.pitchDeckFile || "-"}</p>

        <hr>

        <p><b>Investor:</b> ${req.investorName}</p>
        <p><b>Role:</b> ${req.investorRole}</p>
        <p><b>Company:</b> ${req.investorCompany}</p>
        <p><b>Ticket Size:</b> ${req.ticketSize}</p>
        <p><b>Status:</b> ${req.status}</p>
        <p><b>Requested At:</b> ${req.requestedAt}</p>
      </div>
    `
    )
    .join("");
}

/* Load admin requests on page load */
loadAdminRequests();

/* Keep requested buttons disabled after refresh */
function markRequestedInvestors() {
  const founderData = getStoredObject("founderData");
  const requests = getStoredArray("adminInvestorRequests");

  if (!founderData || requests.length === 0) return;

  investorButtons.forEach((button) => {
    const card = button.closest(".investor-card");
    if (!card) return;

    const investorName = card.querySelector("h3")?.textContent || "";

    const alreadyRequested = requests.some(
      (req) =>
        req.investorName === investorName &&
        req.founder?.email === founderData.email
    );

    if (alreadyRequested) {
      button.textContent = "Requested ✓";
      button.disabled = true;
    }
  });
}

markRequestedInvestors();

/* Reset all demo data for testing */
function resetNextGenData() {
  localStorage.removeItem("pitchDeckSubmitted");
  localStorage.removeItem("founderData");
  localStorage.removeItem("adminInvestorRequests");
  location.reload();
}

/* Optional: expose reset function to browser console */
window.resetNextGenData = resetNextGenData;