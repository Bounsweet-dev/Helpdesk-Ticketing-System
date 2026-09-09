const filterButton = document.getElementById("main-ticket-list-filter-button");
const ticketFilters = document.querySelector(".main-ticket-list-filter");

filterButton.addEventListener("click", function() {

    ticketFilters.classList.toggle("collapsed");

});