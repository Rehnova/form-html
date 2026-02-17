document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const loader = document.getElementById("loader");
    loader.style.display = "block";

    const form = document.getElementById("registerForm");

    // Remove previous message
    const prevMsg = document.getElementById("successMsg");
    if (prevMsg) prevMsg.remove();

    const fileInput = document.getElementById("screenshot");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload a screenshot.");
        loader.style.display = "none";
        return;
    }

    try {
        // =========================
        // 1️⃣ Upload to Cloudinary
        // =========================
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", file);
        cloudinaryData.append("upload_preset", "uytgqt3j");

        const cloudinaryResponse = await fetch(
            "https://api.cloudinary.com/v1_1/dhcayqpqr/image/upload",
            {
                method: "POST",
                body: cloudinaryData
            }
        );

        if (!cloudinaryResponse.ok) {
            throw new Error("Cloudinary upload failed");
        }

        const cloudinaryResult = await cloudinaryResponse.json();
        const imageUrl = cloudinaryResult.secure_url;

        // =========================
        // 2️⃣ Send to Apps Script
        // =========================
        const response = await fetch("https://script.google.com/macros/s/AKfycbyG6UHMBYw8kQs2RvS85_yChurmH1ZXKEkq_t6iNBB-UFnf2uENukMPsI4ps4bb-bRc/exec", {
            method: "POST",
            body: JSON.stringify({
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                whatsapp: document.getElementById("whatsapp").value.trim(),
                account_number: document.getElementById("account").value.trim(),
                screenshot_url: imageUrl
            })
        });

        if (!response.ok) {
            throw new Error("Apps Script request failed");
        }

        const result = await response.json();

        if (result.status !== "ok") {
            throw new Error(result.message || "Submission error");
        }

        // =========================
        // 3️⃣ Success UI
        // =========================
        form.reset();
        loader.style.display = "none";

        const successMsg = document.createElement("p");
        successMsg.id = "successMsg";
        successMsg.textContent = "✅ Submitted successfully!";
        successMsg.style.color = "#16a34a";
        successMsg.style.fontWeight = "600";
        successMsg.style.textAlign = "center";
        successMsg.style.marginTop = "15px";

        form.appendChild(successMsg);

        setTimeout(() => successMsg.remove(), 5000);

    } catch (error) {
        console.error("Error:", error);
        loader.style.display = "none";
        alert("Something went wrong. Please try again.");
    }
});