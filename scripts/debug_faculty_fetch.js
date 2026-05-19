async function checkFaculty() {
    try {
        const res = await fetch("http://localhost:5000/api/faculty");
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data sample:", JSON.stringify(data[0], null, 2));
        console.log("Total count:", data.length);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkFaculty();
