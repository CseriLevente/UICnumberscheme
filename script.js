// Global variables to hold the external data
let freightTypes = [];
let countryCodes = {};

// Load the JSON files on page load
document.addEventListener("DOMContentLoaded", () => {
  fetch("freightTypes.json")
    .then(response => response.json())
    .then(data => freightTypes = data)
    .catch(error => console.error("Error loading freightTypes.json:", error));

  fetch("countries.json")
    .then(response => response.json())
    .then(data => countryCodes = data)
    .catch(error => console.error("Error loading countries.json:", error));

  // Attach event listener for Enter key on the input field
  document.getElementById("uicInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleSubmit();
  });
});

// Function to calculate redundancy check digit for 11-digit number
function calculateCheckDigit(input) {
    //remove all non-digit characters 
  const digits = input.replace(/\D/g, '');
  if (digits.length !== 11) return null;

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    // alternating multiplier based on odd or even i
    const multiplier = (i % 2 === 0) ? 2 : 1;
    const product = parseInt(digits[i], 10) * multiplier;
    //if it is a 2 digit number it adds the first and second digits together
    sum += Math.floor(product / 10) + (product % 10);
  }
  //found this during testing, that if the sum is 10 then it should be made 0
  let controlDigit = (10 - (sum % 10)) % 10;
  return controlDigit;
}

// Function to get the freight car type description based on a two-digit code
function getFreightType(codeStr) {
  let codeNum = parseInt(codeStr, 10);

  // Ensure freight code is two-digit format (e.g., 0 → "00", 1 → "01")
  let formattedCode = codeNum < 10 ? `0${codeNum}` : `${codeNum}`;

  for (let entry of freightTypes) {
    if (entry.range.includes("-")) {
      let [min, max] = entry.range.split("-").map(Number);
      if (codeNum >= min && codeNum <= max) return entry.description;
    } else if (formattedCode === entry.range) {
      return entry.description;
    }
  }

  return "Freight type not found";
}

// Function to handle the submit action
function handleSubmit() {
  const inputField = document.getElementById("uicInput");
  const outputField = document.getElementById("output");
  const rawInput = inputField.value;
  const digitsOnly = rawInput.replace(/\D/g, '');

  if (digitsOnly.length === 11) {
    const checkDigit = calculateCheckDigit(digitsOnly);
    if (checkDigit === null) return;
    outputField.innerHTML = `<p>Digit 12: redundancy check digit: ${checkDigit}</p>
                             <p>Whole number: ${digitsOnly}${checkDigit}</p>`;
  }
  else if (digitsOnly.length === 12) {
    const countryCode = digitsOnly.substring(2, 4);
    let freightCode = digitsOnly.substring(4, 6);

    // Ensure the freightCode is always two digits
    if (freightCode.length === 1) {
      freightCode = "0" + freightCode;
    }

    const countryInfo = countryCodes[countryCode] || "Country code not found";
    const freightInfo = getFreightType(freightCode);

    outputField.innerHTML = `<p>Country: ${countryInfo}</p>
                             <p>Type of freight car: ${freightInfo}</p>`;
  }
  else {
    outputField.innerHTML = "<p>Please enter exactly 11 or 12 digits.</p>";
  }
}

// Function to clear the input and output fields
function handleClear() {
  document.getElementById("uicInput").value = "";
  document.getElementById("output").innerHTML = "";
}

// Attach event listeners to buttons
document.getElementById("submitBtn").addEventListener("click", handleSubmit);
document.getElementById("clearBtn").addEventListener("click", handleClear);
