document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const loader = document.getElementById("loader");
    loader.style.display = "block";

    // Remove any previous success message
    const prevMsg = document.getElementById("successMsg");
    if (prevMsg) prevMsg.remove();

    const file = document.getElementById("screenshot").files[0];

    if (!file) {
        alert("Please upload a screenshot.");
        loader.style.display = "none";
        return;
    }

    try {
        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "uytgqt3j");

        const cloudinaryResponse = await fetch(
            "https://api.cloudinary.com/v1_1/dhcayqpqr/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const cloudinaryData = await cloudinaryResponse.json();
        const imageUrl = cloudinaryData.secure_url;

        // Send all data to n8n webhook
        const response = await fetch("https://qbs.onrender.com/webhook/campaign-webhook", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                whatsapp: document.getElementById("whatsapp").value,
                account_number: document.getElementById("account").value,
                screenshot_url: imageUrl
            })
        });

        if (response.ok) { // status 200-299
            // Reset form
            document.getElementById("registerForm").reset();
            loader.style.display = "none";

            // Show success message
            const successMsg = document.createElement("p");
            successMsg.id = "successMsg";
            successMsg.textContent = "✅ Submitted successfully!";
            successMsg.style.color = "#16a34a";
            successMsg.style.fontWeight = "600";
            successMsg.style.textAlign = "center";
            successMsg.style.marginTop = "15px";

            document.getElementById("registerForm").appendChild(successMsg);

            // Optionally, remove the message after 5 seconds
            setTimeout(() => successMsg.remove(), 5000);

        } else {
            throw new Error("Failed to submit");
        }

    } catch (error) {
        alert("Something went wrong. Please try again.");
        loader.style.display = "none";
        console.error(error);
    }
});