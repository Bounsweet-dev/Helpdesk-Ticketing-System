const dashboardButton = document.getElementById("dashboardButton");
const ticketButton = document.getElementById("ticketButton");
const createTicketButton = document.getElementById("createTicketButton");
const knowledgeBaseButton = document.getElementById("knowledgeBaseButton");

const content = document.getElementById("content");

ticketButton.addEventListener("click", function(){

    content.innerHTML = `
        <h1>Ticket List</h1>

        <ul>
            <li>Ticket 1</li>
            <li>Ticket 2</li>
            <li>Ticket 3</li>
        </ul>
    `;
});

dashboardButton.addEventListener("click", function(){

    content.innerHTML = `
        <h1>Dashboard</h1>

        <p>Welcome to the Dashboard!</p>
    `;
});

createTicketButton.addEventListener("click", function() {
    
    content.innerHTML = `
        <h1>Create Ticket</h1>

        <p>"Ticket type and stuff to add"</p>
    `;
});

knowledgeBaseButton.addEventListener("click", function() {
    
    content.innerHTML = `
        <h1>Knowledge Bases</h1>

        <ul>
            <li>Knowledge Base 1</li>
            <li>Knowledge Base 2</li>
            <li>Knowledge Base 2</li>
        </ul>
    `;
});