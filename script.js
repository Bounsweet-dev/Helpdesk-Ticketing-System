// Lucide Icons
lucide.createIcons();

// ================
//    Page Setup
// ================

const loginPage = document.querySelector(".login-page")
const dashboardPage = document.querySelector(".main-dashboard");
const createTicketPage = document.querySelector(".main-create-ticket");
const mainTicketInformationPage = document.querySelector(".main-ticket-information");
const ticketListPage = document.querySelector(".main-ticket-list");
const knowledgeBasePage = document.querySelector(".main-knowledge-base");
const knowledgeBaseArticlePage = document.querySelector(".main-knowledge-base-article-page");
const userHelpPage = document.querySelector(".user-main-ask-for-help-user-information");

// =========================================
//    Temporary User Data (To Be Removed)
// =========================================

const users = [
    {
        name: "John Doe",
        employeeNumber: "EMP001",
        email: "jodoe@nexusdesk.com",
        jobTitle: "L1 IT Helpdesk"
    },
    {
        name: "Jane Smith",
        employeeNumber: "EMP002",
        email: "jasmith@nexusdesk.com",
        jobTitle: "L2 IT Helpdesk"
    },
    {
        name: "Mark Wilson",
        employeeNumber: "EMP003",
        email: "mawillson@nexusdesk.com",
        jobTitle: "Cybersecurity Analyst I"
    },
    {
        name: "Margarette Barrel",
        employeeNumber: "EMP004",
        email: "mabarrel@nexusdesk.com",
        jobTitle: "Network Engineer I"
    },
    {
        name: "Kevin Baller",
        employeeNumber: "EMP005",
        email: "keballer@nexusdesk.com",
        jobTitle: "IT Manager"
    }
];


// ==============================
//    Temporary Recent Tickets
// ==============================

const tickets = [
    {
        number: 1000,
        subject: "Computer Won't Start",
        priority: "High",
        state: "Open"
    },
    {
        number: 1001,
        subject: "Cannot Connect to Wi-Fi",
        priority: "Medium",
        state: "Pending"
    },
    {
        number: 1002,
        subject: "Printer is not Printing",
        priority: "Medium",
        state: "Open"
    },
    {
        number: 1003,
        subject: "Password Reset",
        priority: "Low",
        state: "Pending"
    }
];

// ===========================
//    Temporary KB Articles
// ===========================

    const knowledgeBaseArticles = [

        {
            id: 1,
            title: "How to Reset a User Password",
            category: "Account",
            description: "Steps for resetting a user's password when they have forgotten their credentials.",
            updatedDate: "Sep 8, 2026",
            readTime: "5 min read",
            content: {
                problem: "The user has forgotten their password and is unable to access their account.",

                causes: [
                    "The user forgot their password.",
                    "The password has expired.",
                    "The account is locked."
                ],

                steps: [
                    "Verify the user's identity.",
                    "Open the user's account in Active Directory.",
                    "Select the option to reset the password.",
                    "Set a temporary password.",
                    "Provide the temporary password to the user securely."
                ],

                resolution: "The user should now be able to sign in using the temporary password and create a new password when prompted."
            }
        },

        {
            id: 2,
            title: "How to Unlock a User Account",
            category: "Account",
            description: "Steps for unlocking a user account after multiple failed login attempts."
        },

        {
            id: 3,
            title: "Computer Is Running Slowly",
            category: "Hardware",
            description: "Basic troubleshooting steps for a computer experiencing slow performance."
        },

        {
            id: 4,
            title: "No Internet Connection",
            category: "Network",
            description: "Basic troubleshooting steps when a computer cannot connect to the internet."
        },

        {
            id: 5,
            title: "How to Clear Browser Cache",
            category: "Software",
            description: "Steps for clearing cached browser data when websites are not loading correctly."
        },

        {
            id: 6,
            title: "Printer Is Not Printing",
            category: "Hardware",
            description: "Basic troubleshooting steps for a printer that is not producing printed documents."
        },

        {
            id: 7,
            title: "Microsoft Application Is Not Responding",
            category: "Software",
            description: "Troubleshooting steps for Microsoft applications that become frozen or stop responding."
        },

        {
            id: 8,
            title: "How to Check an IP Address",
            category: "Network",
            description: "Instructions for checking the IP address assigned to a Windows computer."
        },

        {
            id: 9,
            title: "Computer Has No Audio",
            category: "Hardware",
            description: "Basic troubleshooting steps for a computer that has no sound."
        },

        {
            id: 10,
            title: "When Should an IT Ticket Be Escalated?",
            category: "Other",
            description: "Guidelines for determining when a helpdesk ticket should be escalated to another team."
        }

    ];

// ======================
//    Shared Functions
// ======================

function generateTicketNumber() {

    let ticketCounter = localStorage.getItem("ticketCounter");

    if (ticketCounter === null) {

        ticketCounter = 1000;

    } else {

        ticketCounter = parseInt(ticketCounter);
        ticketCounter++;
    };

    localStorage.setItem("ticketCounter", ticketCounter);

    return "INC" + ticketCounter;

}

// Getting tickets from the local storage

function getTickets() {

    const tickets = [];

    for (let i = 0; i < localStorage.length; i++) {

        const key = localStorage.key(i);

        if (key === "currentTicket") {
            continue;
        }

        const ticketData = localStorage.getItem(key);

        try {

            const ticket = JSON.parse(ticketData);

            if (ticket && ticket.ticketNumber) {
                tickets.push(ticket);
            }
        } catch (error) {

            // Ignore localStorage items that are not tickets

        }

    }

    return tickets;

}

// ========================
//    Login Page Scripts
// ========================

if (loginPage) {

    // Login remember me

    const loginUsername = document.getElementById("login-username");
    const loginRemember = document.getElementById("login-remember");
    const rememberedUsername = localStorage.getItem("rememberedUsername");

    if (rememberedUsername) {

        loginUsername.value = rememberedUsername;
        loginRemember.checked = true;

    }

    // Login password eye icon

    const loginPassword = document.getElementById("login-password");
    const loginPasswordToggle = document.getElementById("login-password-toggle");
    loginPasswordToggle.addEventListener("click", function() {

        if (loginPassword.type === "password") {

            loginPassword.type = "text";
            loginPasswordToggle.innerHTML = '<i data-lucide="eye-off"></i>';

        } else {

            loginPassword.type = "password";
            loginPasswordToggle.innerHTML = '<i data-lucide="eye"></i>';

        }

        lucide.createIcons();

    });

    // Temporary login

    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        const loginButton = document.querySelector(".login-button");

        loginError.style.display = "none";

        loginButton.textContent = "Loggin in...";
        loginButton.disabled = true;

        setTimeout(function() {

            if (
                username === "admin" &&
                password === "admin123"
            ) {

                if (loginRemember.checked) {

                    localStorage.setItem(
                        "rememberedUsername", 
                        username
                    );

                } else {

                    localStorage.removeItem(
                        "rememberedUsername"
                    );

                }

                window.location.href = "dashboard.html";

            } else {

                loginError.style.display = "block";
                loginButton.textContent = "Login";
                loginButton.disabled = false;

            }

        });

    }, 800);
    
    loginForm.addEventListener("input", function() {
        loginError.style.display = "none";
    });

    // Forgot password

    const loginForgotPassword = document.getElementById("login-forgot-password");
    loginForgotPassword.addEventListener("click", function(event) {

        event.preventDefault();

        alert("Password reset page under construction.");
    });

}

// =======================
//    Dashboard Scripts
// =======================

if (dashboardPage) {

    const tickets = getTickets();

    // Dashboard Functions

    function loadRecentTickets() {

        const recentTicketsList = document.getElementById("main-dashboard-recent-tickets-list");

        recentTicketsList.innerHTML = "";

        // Showing the most recent tickets first

        const recentTickets = [...tickets].reverse().slice(0,5);

        recentTickets.forEach(function(ticket) {

            const ticketLink = document.createElement("a");
            ticketLink.href = "ticket-main-page.html";
            ticketLink.textContent = ticket.ticketNumber + " - " + ticket.subject;
            
            ticketLink.addEventListener("click", function() {

                localStorage.setItem(
                    "currentTicket",
                    ticket.ticketNumber
                );

            });

            recentTicketsList.appendChild(ticketLink);

        });

    }

    // Dashboard Cards

    const totalTickets = tickets.length;

    const unassignedTickets = tickets.filter(function(ticket) {

        return(
            !ticket.assignedTo
        );

    }).length;

    const pendingTickets = tickets.filter(function(ticket) {

        return ticket.status === "pending";

    }).length;

    const resolvedTickets = tickets.filter(function(ticket){

        return ticket.status === "resolved";

    }).length;

    document.getElementById("dashboard-ticket-card").textContent = totalTickets;
    document.getElementById("dashboard-unassigned-ticket-card").textContent = unassignedTickets;
    document.getElementById("dashboard-pending-ticket-card").textContent = pendingTickets;
    document.getElementById("dashboard-resolved-ticket-card").textContent = resolvedTickets;

    // Recent ticket list

    loadRecentTickets();

    // Priority tickets

    const highPriorityTickets = tickets.filter(function(ticket) {

        return ticket.priority === "high";

    }).length;

    const mediumPriorityTickets = tickets.filter(function(ticket) {

        return ticket.priority === "medium";

    }).length; 

    const lowPriorityTickets = tickets.filter(function(ticket) {

        return ticket.priority === "low";

    }).length;

    document.getElementById("dashboard-priority-tickets-high").textContent = highPriorityTickets;
    document.getElementById("dashboard-priority-tickets-medium").textContent = mediumPriorityTickets;
    document.getElementById("dashboard-priority-tickets-low").textContent = lowPriorityTickets;

    // Graph Scripts

    // tickets created on current day

    const today = new Date().toLocaleDateString();

    const createdToday = tickets.filter(function(ticket) {
        return ticket.createdDate === today;
    }).length;

    const resolvedToday = tickets.filter(function(ticket) {

        return (
            ticket.status === "resolved" &&
            ticket.createdDate === today
        );

    }).length; 

    document.getElementById("dashboard-created-today").textContent = createdToday;
    document.getElementById("dashboard-resolved-today").textContent = resolvedToday;

    // Ticket Activity Graph

    function getTicketActivity() {

        const activity = [];

        for (let i = 6; i >= 0; i--) {

            const date = new Date();

            date.setDate(date.getDate() - i);

            const dateString = date.toLocaleDateString();

            const created = tickets.filter(function(ticket) {

                return ticket.createdDate === dateString;

            }).length;

            const resolved = tickets.filter(function(ticket) {

                return ticket.resolvedDate === dateString;

            }).length;

            activity.push({
                date: dateString,
                created: created,
                resolved: resolved
            });

        }
        
        return activity;

    }

    // Converting data into array and making the chart

    function loadTicketActivityChart() {

        const activity = getTicketActivity();

        const chartLabels = activity.map(function(day) {
            return day.date;
        });

        const createdData = activity.map(function(day) {
            return day.created;
        });

        const resolvedData = activity.map(function(day) {
            return day.resolved;
        });

        const chart = new Chart(

            document.getElementById("dashboard-ticket-activity-chart"),
            {
                type: "line",
                data: {
                    labels: chartLabels,

                    datasets: [
                        {
                            label: "Created",
                            data: createdData
                        },
                        {
                            label: "Resolved",
                            data: resolvedData
                        }
                    ]
                },

                options: {
                    responsive: true,


                    plugins: {
                        legend: {
                            display: true
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepsize: 1
                            }
                        }
                    }
                }
            }

        );

    }

    loadTicketActivityChart();

}

// ===========================
//    Create Ticket Scripts
// ===========================

if (createTicketPage) {

    // HTML Elements

    const userInput = document.getElementById("user");
    const employeeNumberInput = document.getElementById("employee-number");
    const employeeEmailInput = document.getElementById("employee-email");
    const employeeJobTitleInput = document.getElementById("employee-job-title");
    const categoryInput = document.getElementById("category");
    const priorityInput = document.getElementById("priority");
    const subjectInput = document.getElementById("subject");
    const descriptionInput = document.getElementById("description");

    const cancelButton = document.querySelector(".main-create-ticket-buttons-cancel");
    const createButton = document.querySelector(".main-create-ticket-buttons-create");

    // Create Ticket Functions

    function searchUser() {

        const searchValue = userInput.value.toLowerCase().trim();

        // Clear Information

        employeeNumberInput.value = "";
        employeeEmailInput.value = "";
        employeeJobTitleInput.value = "";

        // Stop if User Input is Empty

        if (searchValue === "") {
            return;
        }

        // Find User

        const foundUser = users.find(function(user) {

            return user.name.toLowerCase().includes(searchValue);

        });

        // Found User

        if (foundUser) {

            employeeNumberInput.value = foundUser.employeeNumber;
            employeeEmailInput.value = foundUser.email;
            employeeJobTitleInput.value = foundUser.jobTitle;
            
        }

    }

    // Create Ticket Function

    function createTicket() {

        // Get Input Values

        const user = userInput.value.trim();
        const employeeNumber = employeeNumberInput.value.trim();
        const employeeEmail = employeeEmailInput.value.trim();
        const employeeJobTitle = employeeJobTitleInput.value.trim();
        const category = categoryInput.value;
        const priority = priorityInput.value;
        const subject = subjectInput.value.trim();
        const description = descriptionInput.value.trim();

        // Validate Required Fields

        if (user === "") {

            alert("Please select a user.")
            userInput.focus();
            return;

        }

        if (category === "") {

            alert("Please select a category.")
            categoryInput.focus();
            return;
        }

        if (priority === "") {

            alert("Please select a priority level.")
            priorityInput.focus();
            return;
        }

        if (subject === "") {

            alert("Enter ticket subject before creating ticket.")
            subjectInput.focus();
            return;
        }

        if (description === "") {

            alert("Enter ticket description before creating ticket.")
            descriptionInput.focus();
            return;
        }

        // Generate Ticket Number

        const ticketNumber = generateTicketNumber();

        // Create Ticket Object

        const ticket = {
            ticketNumber: ticketNumber,
            user: user,
            employeeNumber: employeeNumber,
            employeeEmail: employeeEmail,
            employeeJobTitle: employeeJobTitle,
            category: category,
            priority: priority,
            subject: subject,
            description: description,
            status: "in-progress",
            assignedTo: "",
            assignedDepartment: "",
            worknotes: "",
            createdDate: new Date().toLocaleDateString(),
            resolvedDate: null
        };

        // Save Temporary

        console.log("Ticket Created:", ticket);

        localStorage.setItem(
            ticketNumber,
            JSON.stringify(ticket)
        );

        localStorage.setItem(
            "currentTicket",
            ticketNumber
        );

        // Success Message

        alert("Ticket created successfully!\n\n Ticket Number: " + ticketNumber);

        // Redirect to Ticket Information Page

        window.location.href = "ticket-main-page.html";


    }

    function cancelTicket() {

        const confirmCancel = confirm("Are you sure you want to cancel ticket creation?");

        if (confirmCancel) {

            window.location.href = "ticket-list.html";

        }

    }

    // Event Listeners

    userInput.addEventListener("input", searchUser);
    createButton.addEventListener("click", createTicket);
    cancelButton.addEventListener("click", cancelTicket);

}

// =============================
//    Ticket Main Page Script
// =============================

if (mainTicketInformationPage) {

    // HTML Elements

    const ticketNumber = document.getElementById("ticket-number");
    const ticketUser = document.getElementById("user");
    const ticketEmployeeNumber = document.getElementById("employee-number");
    const ticketEmployeeEmail = document.getElementById("employee-email");
    const ticketEmployeeJobTitle = document.getElementById("employee-job-title");
    const ticketCategory = document.getElementById("category");
    const ticketPriority = document.getElementById("priority");
    const ticketStatus = document.getElementById("ticket-status");
    const ticketCreatedDate = document.getElementById("ticket-created-date");
    const ticketAssignedDepartment = document.getElementById("assigned-department");
    const ticketAssignedTechnician = document.getElementById("assigned-technician");
    const ticketSubject = document.getElementById("subject");
    const ticketDescription = document.getElementById("description");
    const ticketWorknotes = document.getElementById("worknotes");

    const ticketCancelButton = document.getElementById("main-ticket-information-buttons-cancel");
    const ticketSaveChangesButton = document.getElementById("main-ticket-information-buttons-save-changes");
    const ticketResolveButton = document.getElementById("main-ticket-information-buttons-resolve");
    const ticketReopenButton = document.getElementById("main-ticket-information-buttons-reopen");

    // Current ticket setup

    let currentTicket;
    let ticket;

    // Ticket Functions

    function loadCurrentTicket() {

        // Get saved ticket from localStorage

        currentTicket = localStorage.getItem("currentTicket");

        // Check if ticket exists

        if (!currentTicket) {

            alert("No ticket found. Redirecting to Ticket List.");
            window.location.href = "ticket-list.html";
            return;

        }

        // Get saved ticket data

        const ticketData = localStorage.getItem(currentTicket);

        if (!ticketData) {

            alert("Ticket data not found. Redirecting to Ticket List.");
            window.location.href = "ticket-list.html";
            return;

        }

        // Convert JSON to object

        ticket = JSON.parse(ticketData);

        // Load ticket values

        ticketNumber.value = ticket.ticketNumber;
        ticketUser.value = ticket.user;
        ticketEmployeeNumber.value = ticket.employeeNumber;
        ticketEmployeeEmail.value = ticket.employeeEmail;
        ticketEmployeeJobTitle.value = ticket.employeeJobTitle;
        ticketCategory.value = ticket.category;
        ticketPriority.value = ticket.priority;
        ticketStatus.value = ticket.status;
        ticketCreatedDate.value = ticket.createdDate;
        ticketAssignedDepartment.value = ticket.assignedDepartment;
        ticketAssignedTechnician.value = ticket.assignedTo;
        ticketSubject.value = ticket.subject;
        ticketDescription.value = ticket.description;
        ticketWorknotes.value = ticket.worknotes;

        // Check ticket status

        if (ticket.status === "resolved") {

            lockTicket();

        }

    }

    function lockTicket() {

        // Hide normal buttons

        ticketCancelButton.style.display = "none";
        ticketSaveChangesButton.style.display = "none";
        ticketResolveButton.style.display = "none";
        ticketReopenButton.style.display = "flex";

        // Lock Fields

        ticketStatus.disabled = true;
        ticketCategory.disabled = true;
        ticketPriority.disabled = true;
        ticketAssignedDepartment.disabled = true;
        ticketAssignedTechnician.disabled = true;
        ticketSubject.readOnly = true;
        ticketDescription.readOnly = true;
        ticketWorknotes.readOnly = true;

        // Adding gray styling to locked fields

        ticketStatus.classList.add("ticket-resolved");
        ticketCategory.classList.add("ticket-resolved");
        ticketPriority.classList.add("ticket-resolved");
        ticketAssignedDepartment.classList.add("ticket-resolved");
        ticketAssignedTechnician.classList.add("ticket-resolved");
        ticketSubject.classList.add("ticket-resolved");
        ticketDescription.classList.add("ticket-resolved");
        ticketWorknotes.classList.add("ticket-resolved");

    }

    function unlockTicket() {

        // Unlock fields

        ticketStatus.disabled = false;
        ticketCategory.disabled = false;
        ticketPriority.disabled = false;
        ticketAssignedDepartment.disabled = false;
        ticketAssignedTechnician.disabled = false;
        ticketSubject.readOnly = false;
        ticketDescription.readOnly = false;
        ticketWorknotes.readOnly = false;

        // Removing gray styling

        ticketStatus.classList.remove("ticket-resolved");
        ticketCategory.classList.remove("ticket-resolved");
        ticketPriority.classList.remove("ticket-resolved");
        ticketAssignedDepartment.classList.remove("ticket-resolved");
        ticketAssignedTechnician.classList.remove("ticket-resolved");
        ticketSubject.classList.remove("ticket-resolved");
        ticketDescription.classList.remove("ticket-resolved");
        ticketWorknotes.classList.remove("ticket-resolved");

        // Showing normal buttons back

        ticketCancelButton.style.display = "flex";
        ticketSaveChangesButton.style.display = "flex";
        ticketResolveButton.style.display = "flex";

        ticketReopenButton.style.display = "none";

    }

    function saveChanges(showAlert = true) {

        // Get changed values

        ticket.status = ticketStatus.value;
        ticket.priority = ticketPriority.value;
        ticket.assignedDepartment = ticketAssignedDepartment.value;
        ticket.assignedTo = ticketAssignedTechnician.value;
        ticket.subject = ticketSubject.value;
        ticket.description = ticketDescription.value;
        ticket.worknotes = ticketWorknotes.value;

        // Save ticket

        localStorage.setItem(
            currentTicket,
            JSON.stringify(ticket)
        );

        if (showAlert) {
            alert("Ticket changes saved.");
        }

    }

    function cancelChanges() {

        const confirmCancel = confirm("Do you want to remove all changes?")

        if (confirmCancel) {

            loadCurrentTicket();

        }

    }

    function resolveTicket() {

        // Change status

        ticket.status = "resolved";
        ticket.resolvedDate = new Date().toLocaleDateString();
        ticketStatus.value = "resolved";

        // Lock and save ticket

        saveChanges(false);
        lockTicket();

    }

    function reopenTicket() {

        // Change status

        ticket.status = "in-progress"
        ticket.resolvedDate = null;
        ticketStatus.value = "in-progress"

        // Save ticket

        localStorage.setItem(
            currentTicket,
            JSON.stringify(ticket)
        );

        // Unlock ticket

        unlockTicket();

    }

    // Load current ticket

    loadCurrentTicket();

    // Event listeners

    ticketSaveChangesButton.addEventListener("click", saveChanges);
    ticketCancelButton.addEventListener("click", cancelChanges);
    ticketResolveButton.addEventListener("click", resolveTicket);
    ticketReopenButton.addEventListener("click", reopenTicket);

}

// ========================
//    Ticket List Script
// ========================


if (ticketListPage) {

    // Filter Animation

    const filterButton = document.getElementById("main-ticket-list-filter-button");
    const ticketFilters = document.querySelector(".main-ticket-list-filter");

    filterButton.addEventListener("click", function() {

        ticketFilters.classList.toggle("collapsed");
        filterButton.classList.toggle("active");

    });

    // HTML Elements

    const urlParameters = new URLSearchParams(window.location.search);
    const dashboardFilter = urlParameters.get("filter");

    const ticketNumberFilter = document.getElementById("main-ticket-list-filter-ticket-number");
    const userFilter = document.getElementById("main-ticket-list-filter-user");
    const departmentFilter = document.getElementById("main-ticket-list-filter-department");
    const technicianFilter  = document.getElementById("main-ticket-list-filter-technician");
    const priorityFilter = document.getElementById("main-ticket-list-filter-priority");
    const statusFilter = document.getElementById("ticket-status");
    const dateFilter = document.getElementById("main-ticket-list-filter-date");
    const categoryFilter = document.getElementById("main-ticket-list-filter-category");

    const clearFilterButton = document.getElementById("main-ticket-list-filter-clear");
    const applyFilterButton = document.getElementById("main-ticket-list-filter-apply");

    const ticketList = document.querySelector(".main-ticket-list-main-list");
    const ticketListCount = document.getElementById("main-ticket-list-count");

    // Loading ticket data and showing ticket count

    function loadTicketList(ticketData) {

        ticketList.innerHTML = "";

        const ticketWord = ticketData.length === 1 ? "ticket" : "tickets";

        ticketListCount.textContent = `Showing ${ticketData.length} ${ticketWord}`;

        if(ticketData.length === 0) {

            const noResults = document.createElement("div");
            noResults.classList.add("ticket-list-no-results");
            noResults.textContent = "No tickets found.";
            ticketList.appendChild(noResults);
            return;

        }

        ticketData.forEach(function(ticket) {

            const ticketRow = document.createElement("div");
            ticketRow.classList.add("ticket-row");

            const ticketNumber = document.createElement("a");
            ticketNumber.textContent = ticket.ticketNumber;
            ticketNumber.href = "ticket-main-page.html";

            ticketNumber.addEventListener("click", function() {

                localStorage.setItem(
                    "currentTicket",
                    ticket.ticketNumber
                );

            });

            const user = document.createElement("span");
            user.textContent = ticket.user;

            const department = document.createElement("span");
            department.textContent = ticket.assignedDepartment;

            const technician = document.createElement("span");
            technician.textContent = ticket.assignedTo;

            const priority = document.createElement("span");
            priority.textContent = ticket.priority;

            const status = document.createElement("span");
            status.textContent = ticket.status;

            const date = document.createElement("span");
            date.textContent = ticket.createdDate;

            const category = document.createElement("span");
            category.textContent = ticket.category;

            ticketRow.appendChild(ticketNumber);
            ticketRow.appendChild(user);
            ticketRow.appendChild(department);
            ticketRow.appendChild(technician);
            ticketRow.appendChild(priority);
            ticketRow.appendChild(status);
            ticketRow.appendChild(date);
            ticketRow.appendChild(category);
            
            ticketList.appendChild(ticketRow);

        });

    }

    // Apply Filter Function for the Apply Filter Button

    function applyFilters() {

        const tickets = getTickets();

        console.log(tickets);

        const filteredTickets = tickets.filter(function(ticket) {

            const ticketNumberMatch = ticket.ticketNumber.toLowerCase().includes(ticketNumberFilter.value.toLowerCase());
            const userMatch = ticket.user.toLowerCase().includes(userFilter.value.toLowerCase());
            const departmentMatch = ticket.assignedDepartment.toLowerCase().includes(departmentFilter.value.toLowerCase());
            const technicianMatch = dashboardFilter === "unassigned" 
                ? !ticket.assignedTo 
                : ticket.assignedTo.toLowerCase().includes(technicianFilter.value.toLowerCase());
            const priorityMatch = priorityFilter.value === "" || ticket.priority === priorityFilter.value;
            const statusMatch = statusFilter.value === "" || ticket.status === statusFilter.value;
            const dateMatch = ticket.createdDate.toLowerCase().includes(dateFilter.value.toLowerCase());
            const categoryMatch = categoryFilter.value === "" || ticket.category === categoryFilter.value;

            return (

                ticketNumberMatch &&
                userMatch &&
                departmentMatch &&
                technicianMatch &&
                priorityMatch &&
                statusMatch &&
                dateMatch &&
                categoryMatch

            );

        });
        
        loadTicketList(filteredTickets);

    }

    // Clear Filter Function for the clear filter button

    function clearFilters() {

        ticketNumberFilter.value = "";
        userFilter.value = "";
        departmentFilter.value = "";
        technicianFilter.value = "";
        priorityFilter.value = "";
        statusFilter.value = "";
        dateFilter.value = "";
        categoryFilter.value = "";

        loadTicketList(getTickets());

    }

    // Event listeners

    applyFilterButton.addEventListener("click", function() {

        applyFilters();

    });

    clearFilterButton.addEventListener("click", function() {

        clearFilters();

    });

    // Dashboard filter

    if (dashboardFilter === "pending") {
        statusFilter.value = "pending";
    }
    if (dashboardFilter === "resolved") {
        statusFilter.value = "resolved";
    }
    if (dashboardFilter === "priority-high") {
        priorityFilter.value = "high";
    }

    if (dashboardFilter === "priority-medium") {
        priorityFilter.value = "medium";
    }

    if (dashboardFilter === "priority-low") {
        priorityFilter.value = "low";
    }

    // First landing page (no filters applied)

    applyFilters();
}

// ============================
//    Knowledge Base Scripts
// ============================

if (knowledgeBasePage) {

    const knowledgeBaseSearch = document.getElementById("search-bar");
    const knowledgeBaseCategoryCards = document.querySelectorAll(".card-knowledge-base");

    let selectedCategories = [];


    // Loading KB Articles

    function loadKnowledgeBaseArticles(articles) {

        const articleList = document.getElementById("main-knowledge-base-article-list");

        articleList.innerHTML = "";

        if (articles.length === 0) {

            const noResults = document.createElement("div");

            noResults.classList.add("knowledge-base-no-results");
            noResults.textContent = "No articles found.";

            articleList.appendChild(noResults);

            return;

        }

        articles.forEach(function(article) {

            const articleCard = document.createElement("div");
            articleCard.classList.add("knowledge-base-article");

            articleCard.addEventListener("click", function() {

                localStorage.setItem("currentKnowledgeBaseArticle", article.id);
                window.location.href = "knowledge-base-article-main-page.html";

            });

            const articleTitle = document.createElement("h3");
            articleTitle.textContent = article.title;

            const articleCategory = document.createElement("span");
            articleCategory.textContent = article.category;

            const articleDescription = document.createElement("p");
            articleDescription.textContent = article.description;

            articleCard.appendChild(articleTitle);
            articleCard.appendChild(articleCategory);
            articleCard.appendChild(articleDescription);
            articleList.appendChild(articleCard);

        });

    }

    function searchKnowledgeBase() {

        const searchText = knowledgeBaseSearch.value.toLowerCase();
        const searchedArticles = knowledgeBaseArticles.filter(function(article) {

            const searchMatch =
                article.title.toLowerCase().includes(searchText) ||
                article.description.toLowerCase().includes(searchText) ||
                article.category.toLowerCase().includes(searchText);

            const categoryMatch = 
                selectedCategories.length === 0 ||
                selectedCategories.includes(article.category);


            return searchMatch && categoryMatch;

        });

        loadKnowledgeBaseArticles(searchedArticles);

    }

    loadKnowledgeBaseArticles(knowledgeBaseArticles);

    // Event Listeners

    knowledgeBaseSearch.addEventListener("input", function(){
        searchKnowledgeBase();
    });

    knowledgeBaseCategoryCards.forEach(function(card) {

        card.addEventListener("click", function(event) {

            event.preventDefault();
            
            const category = card.dataset.category;

            if (selectedCategories.includes(category)) {

                selectedCategories = selectedCategories.filter(function(selectedCategory) {
                    return selectedCategory !== category;
                }); 
                card.classList.remove("active");

            } else {

                selectedCategories.push(category);
                card.classList.add("active");

            }

            searchKnowledgeBase();

        });

    });


}

// =========================================
//    Knowledge Base Article Page Scripts
// =========================================

if (knowledgeBaseArticlePage) {

    // Getting saved article from local storage

    const currentArticle = localStorage.getItem("currentKnowledgeBaseArticle");
    const article = knowledgeBaseArticles.find(function(article) {
        return article.id === Number(currentArticle);
    });

    // Error Handling - When no KB article is detected

    if (!article) {
        const articleContent = document.getElementById("knowledge-base-article-content");
        articleContent.innerHTML = "";
        const message = document.createElement("div");
        message.classList.add("knowledge-base-article-not-found");
        message.textContent = "Article not found.";

        articleContent.appendChild(message);
    } else {

        // Article Title and Metadata

        const articleTitle = document.getElementById("knowledge-base-article-title");
        const articleCategory = document.getElementById("knowledge-base-article-category");
        const articleDate = document.getElementById("knowledge-base-article-date");
        const articleReadTime = document.getElementById("knowledge-base-article-read-time");

        articleTitle.textContent = article.title;
        articleCategory.textContent = article.category;
        articleDate.textContent = "Updated" + article.updatedDate;
        articleReadTime.textContent = article.readTime;

        // Article Contents
        
        const articleContent = document.getElementById("knowledge-base-article-content");

        // Article Problem

        const problemTitle = document.createElement("h2");
        problemTitle.innerHTML = '<i data-lucide="triangle-alert"></i> Problem';
        const problemText = document.createElement("p");
        problemText.textContent = article.content.problem;

        articleContent.appendChild(problemTitle);
        articleContent.appendChild(problemText);

        // Article Causes

        const causesTitle = document.createElement("h2");
        causesTitle.innerHTML = '<i data-lucide="search></i> Possible Causes';
        const causesList = document.createElement("ul");
        article.content.causes.forEach(function(cause) {

            const causeItem = document.createElement("li");
            causeItem.textContent = cause;
            causesList.appendChild(causeItem);

        });
        
        articleContent.appendChild(causesTitle);
        articleContent.appendChild(causesList);

        // Article Troubleshooting Steps

        const stepsTitle = document.createElement("h2");
        stepsTitle.innerHTML = '<i data-lucide="wrench"></i> Troubleshooting Steps';
        const stepsList = document.createElement("ol");
        article.content.steps.forEach(function(step) {

            const stepItem = document.createElement("li");
            stepItem.textContent = step;
            stepsList.appendChild(stepItem);

        });

        articleContent.appendChild(stepsTitle);
        articleContent.appendChild(stepsList);

        // Article Resolution

        const resolutionTitle = document.createElement("h2");
        resolutionTitle.innerHTML = '<i data-lucide="circle-check"></i> Resolution';
        const resolutionText = document.createElement("p");
        resolutionText.textContent = article.content.resolution;

        articleContent.appendChild(resolutionTitle);
        articleContent.appendChild(resolutionText);

        lucide.createIcons();

    }

    // Related Articles Section

        const relatedArticles = knowledgeBaseArticles.filter(function(relatedArticles) {

            return (
                relatedArticles.category === article.category &&
                relatedArticles.id !== article.id
            );

        });
        const relatedArticlesContainer = document.getElementById("knowledge-base-related-articles");

        if (relatedArticles.length === 0) {

            const norelatedArticles = document.createElement("p");
            norelatedArticles.textContent = "No related articles found.";
            relatedArticlesContainer.appendChild(norelatedArticles);

        } else {

            relatedArticles.forEach(function(relatedArticle) {

                const relatedArticleLink = document.createElement("a");
                relatedArticleLink.href = "knowledge-base-article-main-page.html";
                relatedArticleLink.classList.add("knowledge-base-related-article");
                relatedArticleLink.addEventListener("click", function() {

                    localStorage.setItem("currentKnowledgeBaseArticle", relatedArticle.id);

                });

                const relatedArticleTitle = document.createElement("h3");
                relatedArticleTitle.textContent = relatedArticle.title;
                const relatedArticleDescription = document.createElement("p");
                relatedArticleDescription.textContent = relatedArticle.description;

                relatedArticleLink.appendChild(relatedArticleTitle);
                relatedArticleLink.appendChild(relatedArticleDescription);
                relatedArticlesContainer.appendChild(relatedArticleLink);

            });

        }

}

if (userHelpPage) {

    // HTML Elements

    const helpUsername = document.getElementById("help-username");
    const helpEmail = document.getElementById("help-email");
    const helpSubject = document.getElementById("help-subject");
    const helpDescription = document.getElementById("help-description");

    const helpCancelButton = document.querySelector(".user-main-ask-help-cancel-button");
    const helpSubmitButton = document.querySelector(".user-main-ask-help-submit-button");

    const helpRequestForm = document.querySelector(".user-main-ask-for-help-user-information");
    const helpSuccessMessage = document.querySelector(".user-main-ask-for-help-success");
    const helpCreateAnotherButton = document.querySelector(".user-main-ask-for-help-create-another-button");

    // Create ticket with the provided information

    function submitHelpRequest() {

        // Get values

        const helpTicketUsername = helpUsername.value.trim();
        const helpTicketEmail = helpEmail.value.trim();
        const helpTicketSubject = helpSubject.value.trim();
        const helpTicketDescription = helpDescription.value.trim();

        // Validate subject and description fields

        if (helpTicketSubject === "") {

            alert("Enter summary of your issue before submitting.")
            helpSubject.focus();
            return;

        }

        if (helpTicketDescription === "") {

            alert("Describe your issue before submitting.")
            helpDescription.focus();
            return;

        }

        // Generate ticket number

        const helpTicketNumber = generateTicketNumber();

        // Create ticket object

        const ticket = {
            ticketNumber: helpTicketNumber,
            user: helpTicketUsername,
            employeeNumber: "",
            employeeEmail: helpTicketEmail,
            employeeJobTitle: "",
            category: "",
            priority: "low",
            subject: helpTicketSubject,
            description: helpTicketDescription,
            status: "open",
            assignedTo: "",
            assignedDepartment: "",
            worknotes: "",
            createdDate: new Date().toLocaleDateString(),
            resolvedDate: null
        };

        // Save temporary

        console.log("Ticket Created:", ticket);

        localStorage.setItem(
            helpTicketNumber,
            JSON.stringify(ticket)
        );

        localStorage.setItem(
            "currentTicket",
            helpTicketNumber
        );

        // Display success message

        helpRequestForm.style.display = "none";
        helpSuccessMessage.style.display = "flex";

    }

    function helpCancelTicket() {

        const confirmCancel = confirm("Are you sure you want to cancel ticket creation?");

        if (confirmCancel) {

            helpSubject.value = "";
            helpDescription.value = "";

        }

    }

    function helpCreateAnotherTicket() {

        helpSubject.value = "";
        helpDescription.value = "";

        helpSuccessMessage.style.display = "none";
        helpRequestForm.style.display = "flex";

        helpSubject.focus();

    }

    // Event listeners

    helpSubmitButton.addEventListener("click", submitHelpRequest);
    helpCancelButton.addEventListener("click", helpCancelTicket);
    helpCreateAnotherButton.addEventListener("click", helpCreateAnotherTicket);

}