const backendUrl = "http://localhost:5000/api";

// Load hospitals
fetch(`${backendUrl}/hospitals`)
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("hospitalList");
    data.forEach(h => {
      const li = document.createElement("li");
      li.textContent = `${h.name} - Beds: ${h.beds}`;
      list.appendChild(li);
    });
  });

// Load shelters
fetch(`${backendUrl}/shelters`)
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("shelterList");
    data.forEach(s => {
      const li = document.createElement("li");
      li.textContent = `${s.name} - Capacity: ${s.capacity}`;
      list.appendChild(li);
    });
  });

// Handle reports
document.getElementById("reportForm").addEventListener("submit", e => {
  e.preventDefault();
  const text = document.getElementById("reportText").value;

  fetch(`${backendUrl}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  })
    .then(res => res.json())
    .then(report => {
      const list = document.getElementById("reportList");
      const li = document.createElement("li");
      li.textContent = report.text;
      list.appendChild(li);
      document.getElementById("reportText").value = "";
    });
});
