// Smooth button navigation and APK download handling
document.addEventListener("DOMContentLoaded", () => {
  const onlineBtn = document.getElementById("useOnline");
  const apkBtn = document.getElementById("installApp");

  // Replace this URL with your hosted calculator page
  const calculatorURL = "calculator.html";

  // Replace this URL with your hosted APK link
  const apkURL = "https://yourdomain.com/calculator.apk";

  onlineBtn.addEventListener("click", () => {
    window.location.href = calculatorURL;
  });

  apkBtn.addEventListener("click", () => {
    window.open(apkURL, "_blank");
  });
});
