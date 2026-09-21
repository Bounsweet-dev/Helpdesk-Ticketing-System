

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
const ticketWorknotesHistory = document.getElementById("main-ticket-information-worknotes-history");
const knowledgeBaseCreateArticlePage = document.querySelector(".main-knowledge-base-create-article");
const aboutPage = document.querySelector(".main-about-page") !== null;
const forgotPassword = document.querySelector(".forgot-password-page");

// =============================
//    Side Bar Footer Scripts
// =============================

function initializeSidebarAccount() {

    const accountName =
        document.getElementById("sidebar-account-name");

    const accountEmail =
        document.getElementById("sidebar-account-email");

    const accountMenuButton =
        document.getElementById("sidebar-account-menu-button");

    const accountMenu =
        document.getElementById("sidebar-account-menu");

    const logoutButton =
        document.getElementById("sidebar-logout-button");

    // Stop if this page does not have the account section

    if (
        !accountName ||
        !accountEmail ||
        !accountMenuButton ||
        !accountMenu ||
        !logoutButton
    ) {
        return;
    }


    // Load current user

    async function loadSidebarAccount() {

        try {

            const response = await fetch(
                "/api/me",
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to retrieve current user."
                );
            }

            const user = await response.json();

            accountName.textContent =
                user.fullName;

            accountEmail.textContent =
                user.email;

        } catch (error) {

            console.error(
                "Failed to load sidebar account:",
                error
            );

        }

    }


    // Toggle account menu

    accountMenuButton.addEventListener("click", function(event) {

        event.stopPropagation();

        const menuIsOpen =
            accountMenu.style.display === "block";

        accountMenu.style.display =
            menuIsOpen
                ? "none"
                : "block";

    });


    // Close menu when clicking elsewhere

    document.addEventListener("click", function(event) {

        if (
            !accountMenu.contains(event.target) &&
            !accountMenuButton.contains(event.target)
        ) {

            accountMenu.style.display =
                "none";

        }

    });


    // Logout

    logoutButton.addEventListener("click", async function() {

        try {

            const response =
                await fetch(
                    "/api/logout",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

            if (!response.ok) {

                const data =
                    await response.json();

                alert(
                    data.error ||
                    "Failed to log out."
                );

                return;
            }

            window.location.href =
                "index.html";

        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );

            alert(
                "Unable to connect to the server."
            );

        }

    });


    loadSidebarAccount();

}


// ========================
//    Login Page Scripts
// ========================


if (loginPage) {

    // Login elements

    const loginForm = document.getElementById("login-form");
    const loginUsername = document.getElementById("login-username");
    const loginPassword = document.getElementById("login-password");
    const loginPasswordToggle = document.getElementById("login-password-toggle");
    const loginError = document.getElementById("login-error");
    const loginButton = document.querySelector(".login-button");
    const loginForgotPassword = document.getElementById("login-forgot-password");

    // Remember Me

    const loginRemember = document.getElementById("login-remember");
    const rememberedUsername = localStorage.getItem("rememberedUsername");



    // Login password eye icon

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

    // Login

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const username = loginUsername.value.trim();
        const password = loginPassword.value;

        loginError.style.display = "none";
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        try {

            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (loginRemember.checked) {
                localStorage.setItem("rememberedUsername", loginUsername.value.trim());
            } else {
                localStorage.removeItem("rememberedUsername");
            }

            const data = await response.json();

            if (!response.ok) {

                loginError.textContent =
                    data.error || "Invalid username or password.";

                loginError.style.display = "block";

                return;
            }

            if (data.user.role === "employee") {

                window.location.href = "user-help-request.html";

            } else {

                window.location.href = "dashboard.html";

            }

        } catch (error) {

            console.error("Login request failed:", error);

            loginError.textContent = "Unable to connect to the server.";
            loginError.style.display = "block";

        } finally {

            loginButton.disabled = false;
            loginButton.textContent = "Login";

        }

    });

    // Clear login error when user starts typing

    loginForm.addEventListener("input", function() {
        loginError.style.display = "none";
    });

    // Forgot password

    loginForgotPassword.addEventListener("click", function(event) {

        event.preventDefault();

        window.location.href = "forgot-password.html";

    });

    if (rememberedUsername) {
        loginUsername.value = rememberedUsername;
        loginRemember.checked = true;
    }

}

// =============================
//    Forgot Password Scripts
// =============================

if (forgotPassword) {

    // Request button

    const requestPasswordResetButton = document.getElementById("forgot-password-submit");
    const requestSuccessMessage = document.getElementById("forgot-password-notification");
    const forgotPasswordPage = document.getElementById("forgot-password-request");

    requestPasswordResetButton.addEventListener("click", function(event) {

        requestPasswordResetButton.innerHTML = '<i data-lucide="loader-circle"></i>Submitting...';
        lucide.createIcons();

        forgotPasswordPage.style.display = "none";
        requestSuccessMessage.style.display = "flex";

    });

}

// =======================
//    Dashboard Scripts
// =======================

if (dashboardPage) {

    // Dashboard API Helper

    async function getDashboardTickets() {

        try {

            const response = await fetch("/api/tickets",  {
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to retrieve tickets.");
            }

            const tickets = await response.json();

            return tickets.map(function(ticket) {

                return {

                    ticketId: ticket.ticket_id,
                    ticketNumber: ticket.ticket_number,
                    user: ticket.requester,
                    employeeNumber: ticket.employee_number,
                    employeeEmail: ticket.email,
                    employeeJobTitle: ticket.job_title,
                    category: ticket.category,
                    priority: ticket.priority,
                    subject: ticket.subject,
                    description: ticket.description,
                    status: ticket.status,
                    assignedTo: ticket.assigned_to || "",
                    assignedDepartment: ticket.assigned_department || "",
                    createdDate: new Date(ticket.created_at).toLocaleDateString(),
                    resolvedDate: ticket.resolved_at
                        ? new Date(ticket.resolved_at).toLocaleDateString()
                        : null

                };

            });

            

        } catch (error) {
            console.error("Failed to load dashboard tickets:", error);
            return [];
        }

    }

    async function initializeDashboard() {

        const tickets = await getDashboardTickets();

        // Dashboard Functions

        function loadRecentTickets() {

            const recentTicketsList = document.getElementById("main-dashboard-recent-tickets-list");

            recentTicketsList.innerHTML = "";

            // Showing the most recent tickets first

            const recentTickets = tickets.slice(0, 5);

            recentTickets.forEach(function(ticket) {

                const ticketLink = document.createElement("a");
                ticketLink.href = `ticket-main-page.html?id=${ticket.ticketId}`;
                ticketLink.textContent = ticket.ticketNumber + " - " + ticket.subject;

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
                ticket.resolvedDate === today
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

    // Sidebar and Dashboard
    initializeSidebarAccount();
    initializeDashboard();
    

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

    const userResults = document.getElementById("create-ticket-user-results");

    const cancelButton = document.querySelector(
        ".main-create-ticket-buttons-cancel"
    );

    const createButton = document.querySelector(
        ".main-create-ticket-buttons-create"
    );

    // Selected User

    let selectedUserId = null;
    let searchTimeout = null;

    // Search Users

    function searchUser() {

        const searchValue = userInput.value.trim();

        selectedUserId = null;

        employeeNumberInput.value = "";
        employeeEmailInput.value = "";
        employeeJobTitleInput.value = "";

        userResults.innerHTML = "";
        userResults.style.display = "none";

        if (searchValue === "") {
            return;
        }

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(async function() {

            try {

                const response = await fetch(
                    `/api/users/search?query=${encodeURIComponent(searchValue)}`,
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to search users.");
                }

                const users = await response.json();

                if (users.length === 0) {

                    const noResults = document.createElement("div");

                    noResults.classList.add(
                        "create-ticket-user-no-results"
                    );

                    noResults.textContent = "No users found.";

                    userResults.appendChild(noResults);
                    userResults.style.display = "block";

                    return;
                }

                users.forEach(function(user) {

                    const userButton = document.createElement("button");

                    userButton.type = "button";
                    userButton.classList.add(
                        "create-ticket-user-result"
                    );

                    const userName = document.createElement("span");

                    userName.classList.add(
                        "create-ticket-user-result-name"
                    );

                    userName.textContent = user.full_name;

                    const userDetails = document.createElement("span");

                    userDetails.classList.add(
                        "create-ticket-user-result-details"
                    );

                    userDetails.textContent =
                        `${user.employee_number} · ${user.email}`;

                    userButton.appendChild(userName);
                    userButton.appendChild(userDetails);

                    userButton.addEventListener("click", function() {

                        selectedUserId = user.user_id;

                        userInput.value = user.full_name;

                        employeeNumberInput.value =
                            user.employee_number;

                        employeeEmailInput.value =
                            user.email;

                        employeeJobTitleInput.value =
                            user.job_title || "";

                        userResults.innerHTML = "";
                        userResults.style.display = "none";

                    });

                    userResults.appendChild(userButton);

                });

                userResults.style.display = "block";

            } catch (error) {

                console.error("User search failed:", error);

            }

        }, 250);

    }

    // Create Ticket

    async function createTicket() {

        const category = categoryInput.value;
        const priority = priorityInput.value;
        const subject = subjectInput.value.trim();
        const description = descriptionInput.value.trim();

        if (selectedUserId === null) {

            alert("Please select a user from the search results.");
            userInput.focus();
            return;

        }

        if (category === "") {

            alert("Please select a category.");
            categoryInput.focus();
            return;

        }

        if (priority === "") {

            alert("Please select a priority level.");
            priorityInput.focus();
            return;

        }

        if (subject === "") {

            alert("Enter ticket subject before creating ticket.");
            subjectInput.focus();
            return;

        }

        if (description === "") {

            alert("Enter ticket description before creating ticket.");
            descriptionInput.focus();
            return;

        }

        createButton.disabled = true;
        createButton.textContent = "Creating...";

        try {

            const response = await fetch("/api/tickets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",

                body: JSON.stringify({
                    requesterId: selectedUserId,
                    category: category,
                    priority: priority,
                    subject: subject,
                    description: description,
                    status: "in-progress"
                })
            });

            const data = await response.json();

            if (!response.ok) {

                alert(
                    data.error ||
                    "Failed to create ticket."
                );

                return;
            }

            alert(
                "Ticket created successfully!\n\nTicket Number: " +
                data.ticketNumber
            );

            window.location.href = `ticket-main-page.html?id=${data.ticketId}`;

        } catch (error) {

            console.error("Create ticket failed:", error);

            alert("Unable to connect to the server.");

        } finally {

            createButton.disabled = false;
            createButton.innerHTML =
                '<i data-lucide="circle-plus"></i>Create Ticket';

            lucide.createIcons();

        }

    }

    // Cancel Ticket

    function cancelTicket() {

        const confirmCancel = confirm(
            "Are you sure you want to cancel ticket creation?"
        );

        if (confirmCancel) {

            window.location.href = "ticket-list.html";

        }

    }

    // Event Listeners

    userInput.addEventListener("input", searchUser);
    createButton.addEventListener("click", createTicket);
    cancelButton.addEventListener("click",cancelTicket);

    //Side Bar

    initializeSidebarAccount();

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
    const publishWorknoteButton = document.getElementById("main-ticket-information-worknotes-buttons-publish");

    // Current Ticket

    const urlParameters = new URLSearchParams(window.location.search);
    const ticketId = urlParameters.get("id");
    let ticket = null;

    // IDs used by the database

    let assignedDepartmentId = null;
    let assignedTechnicianId = null;

    const ticketAssignedDepartmentResults = document.getElementById("ticket-assigned-department-results");
    const ticketAssignedTechnicianResults = document.getElementById("ticket-assigned-technician-results");

    // UnsavedChanges

    let ticketHasUnsavedChanges = false;
    
    // Getting and displaying worknotes

    async function loadWorknoteHistory() {

        ticketWorknotesHistory.innerHTML = "";

        try {

            const response = await fetch(
                `/api/tickets/${encodeURIComponent(ticketId)}/worknotes`, {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to retrieve worknotes.");
            }

            const worknotes = await response.json();

            if (worknotes.length === 0) {

                const emptyMessage = document.createElement("p");
                emptyMessage.classList.add("main-ticket-information-worknotes-empty");
                emptyMessage.textContent = "No worknotes yet.";
                ticketWorknotesHistory.appendChild(emptyMessage);
                return;

            }

            worknotes.forEach(function(worknote) {

                const worknoteElement = document.createElement("div");
                worknoteElement.classList.add("main-ticket-information-worknote");
                const header = document.createElement("div");
                header.classList.add("main-ticket-information-worknote-header");
                const username = document.createElement("span");
                username.classList.add("main-ticket-information-worknote-user");
                username.textContent = worknote.full_name;
                const date = document.createElement("span");
                date.classList.add("main-ticket-information-worknote-date");
                date.textContent = new Date(worknote.created_at).toLocaleString();
                const note = document.createElement("p");
                note.classList.add("main-ticket-information-worknote-text");
                note.textContent = worknote.note;
                header.appendChild(username);
                header.appendChild(date);
                worknoteElement.appendChild(header);
                worknoteElement.appendChild(note);
                ticketWorknotesHistory.appendChild(worknoteElement);

            });

        } catch (error) {

            console.error("Failed to load worknotes:", error);
            const errorMessage = createElement("p");
            errorMessage.classList.add("main-ticket-information-worknotes-empty");
            errorMessage.textContent = "Unable to load worknotes.";
            ticketWorknotesHistory.appendChild(errorMessage);

        }
        
    }

    // Load Ticket

    async function loadCurrentTicket() {

        if (!ticketId) {

            alert("No ticket selected. Redirecting to Ticket List.");
            window.location.href = "ticket-list.html";
            return;

        }

        try {

            const response = await fetch(
                `/api/tickets/${encodeURIComponent(ticketId)}`,
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {

                if (response.status === 404) {
                    alert(
                        "Ticket not found. Redirecting to Ticket List."
                    );
                } else {
                    alert(
                        "Failed to load ticket. Redirecting to Ticket List."
                    );
                }

                window.location.href = "ticket-list.html";
                return;
            }

            ticket = await response.json();

            // Database IDs

            assignedDepartmentId = ticket.assigned_department_id || null;
            assignedTechnicianId = ticket.assigned_to_user_id || null;

            // Load Ticket Values

            ticketNumber.value = ticket.ticket_number;
            ticketUser.value = ticket.requester;
            ticketEmployeeNumber.value = ticket.employee_number;
            ticketEmployeeEmail.value = ticket.email;
            ticketEmployeeJobTitle.value = ticket.job_title || "";
            ticketCategory.value = ticket.category || "";
            ticketPriority.value = ticket.priority || "";
            ticketStatus.value = ticket.status;
            ticketCreatedDate.value = new Date(ticket.created_at).toLocaleDateString();
            ticketAssignedDepartment.value = ticket.assigned_department || "";
            ticketAssignedTechnician.value = ticket.assigned_to || "";
            ticketSubject.value = ticket.subject || "";
            ticketDescription.value = ticket.description || "";
            ticketWorknotes.value = "";

            // Show all worknotes

            await loadWorknoteHistory();

            // Resolved Ticket

            if (ticket.status === "resolved") {
                lockTicket();
            } else {
                unlockTicket();
            }

            ticketHasUnsavedChanges = false;

        } catch (error) {

            console.error("Failed to load ticket:", error);

            alert(
                "Unable to connect to the server. Redirecting to Ticket List."
            );

            window.location.href = "ticket-list.html";
        }

    }

    // Lock Ticket

    function lockTicket() {

        ticketCancelButton.style.display = "none";
        ticketSaveChangesButton.style.display = "none";
        ticketResolveButton.style.display = "none";
        ticketReopenButton.style.display = "flex";

        ticketStatus.disabled = true;
        ticketCategory.disabled = true;
        ticketPriority.disabled = true;
        ticketAssignedDepartment.disabled = true;
        ticketAssignedTechnician.disabled = true;

        ticketSubject.readOnly = true;
        ticketDescription.readOnly = true;
        ticketWorknotes.readOnly = true;

        ticketStatus.classList.add("ticket-resolved");
        ticketCategory.classList.add("ticket-resolved");
        ticketPriority.classList.add("ticket-resolved");
        ticketAssignedDepartment.classList.add("ticket-resolved");
        ticketAssignedTechnician.classList.add("ticket-resolved");
        ticketSubject.classList.add("ticket-resolved");
        ticketDescription.classList.add("ticket-resolved");
        ticketWorknotes.classList.add("ticket-resolved");
    }

    // Unlock Ticket

    function unlockTicket() {

        ticketStatus.disabled = false;
        ticketCategory.disabled = false;
        ticketPriority.disabled = false;
        ticketAssignedDepartment.disabled = false;
        ticketAssignedTechnician.disabled = false;

        ticketSubject.readOnly = false;
        ticketDescription.readOnly = false;
        ticketWorknotes.readOnly = false;

        ticketStatus.classList.remove("ticket-resolved");
        ticketCategory.classList.remove("ticket-resolved");
        ticketPriority.classList.remove("ticket-resolved");
        ticketAssignedDepartment.classList.remove("ticket-resolved");
        ticketAssignedTechnician.classList.remove("ticket-resolved");
        ticketSubject.classList.remove("ticket-resolved");
        ticketDescription.classList.remove("ticket-resolved");
        ticketWorknotes.classList.remove("ticket-resolved");

        ticketCancelButton.style.display = "flex";
        ticketSaveChangesButton.style.display = "flex";
        ticketResolveButton.style.display = "flex";

        ticketReopenButton.style.display = "none";
    }

    // Hide technician and department search results

    function hideAssignedResults() {

        ticketAssignedDepartmentResults.style.display = "none";
        ticketAssignedTechnicianResults.style.display = "none";

    }

    // Department search

    async function searchAssignedDepartment () {

        const searchValue = ticketAssignedDepartment.value.trim().toLowerCase();

        assignedDepartmentId = null;
        assignedTechnicianId = null;
        ticketAssignedTechnician.value = "";
        ticketAssignedDepartmentResults.innerHTML = "";
        ticketAssignedTechnicianResults.innerHTML = "";
        ticketAssignedDepartmentResults.style.display = "none";
        ticketAssignedTechnicianResults.style.display = "none";

        if (searchValue === "") {
            return;
        }

        try {

            const response = await fetch(
                "/api/departments",
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to retrieve departments.");
            }

            const departments = await response.json();
            const matchingDepartments = departments.filter(

                function(department) {
                    return department.department_name.toLowerCase().includes(searchValue);
                }

            );

            if (matchingDepartments.length === 0) {

                const noResults = document.createElement("div");
                noResults.classList.add("ticket-assigned-search-no-results");
                noResults.textContent = "No departments found.";
                ticketAssignedDepartmentResults.appendChild(noResults);
                ticketAssignedDepartmentResults.style.display = "block";
                
                return;

            }

            matchingDepartments.forEach(function(department) {

                const button = document.createElement("button");
                button.type = "button";
                button.classList.add("ticket-assigned-search-result");
                const name = document.createElement("span");
                name.classList.add("ticket-assigned-search-result-name");
                name.textContent = department.department_name;
                button.appendChild(name);
                button.addEventListener("click", function() {

                    assignedDepartmentId = department.department_id;
                    assignedTechnicianId = null;
                    ticketAssignedDepartment.value = department.department_name;
                    ticketAssignedTechnician.value = "";
                    ticketAssignedDepartmentResults.innerHTML = "";
                    ticketAssignedDepartmentResults.style.display = "none";

                });

                ticketAssignedDepartmentResults.appendChild(button);

            });

            ticketAssignedDepartmentResults.style.display = "block";

        } catch (error) {

            console.error("Department search failed:", error);
        }

    }

    // Technician Search

    async function searchAssignedTechician() {
        
        const searchValue = ticketAssignedTechnician.value.trim().toLowerCase();
        assignedTechnicianId = null;

        ticketAssignedTechnicianResults.innerHTML = "";
        ticketAssignedTechnicianResults.style.display = "none";

        if (searchValue === "") {
            return;
        }

        if (assignedDepartmentId === null) {
            return;
        }

        try {

            const url = `/api/technicians?departmentId=${assignedDepartmentId}`;

            const response = await fetch(

                url, {
                    credentials: "include"
                }

            );

            if (!response.ok) {
                throw new Error("Failed to retrieve technicians.");
            }

            const technicians = await response.json();
            const matchingTechnicians = technicians.filter(function(technician) {

                const fullName = (technician.full_name || "").toLowerCase();
                const userName = (technician.username || "").toLowerCase();

                return (fullName.includes(searchValue) ||
                        userName.includes(searchValue));

            });

            if (matchingTechnicians.length === 0) {

                const noResults = document.createElement("div");
                noResults.classList.add("ticket-assigned-search-no-results");
                noResults.textContent = "No technicians found.";
                ticketAssignedTechnicianResults.appendChild(noResults);
                ticketAssignedTechnicianResults.style.display = "block";

                return;

            }

            matchingTechnicians.forEach(function(technician) {

                const button = document.createElement("button");
                button.type = "button";
                button.classList.add("ticket-assigned-search-result");


                const name = document.createElement("span");
                name.classList.add("ticket-assigned-search-result-name");
                name.textContent = technician.full_name;
                button.appendChild(name);
                button.addEventListener("click", function() {

                    assignedTechnicianId = technician.user_id;
                    ticketAssignedTechnician.value = technician.full_name;
                    ticketAssignedTechnicianResults.innerHTML = "";
                    ticketAssignedTechnicianResults.style.display = "none";

                });

                ticketAssignedTechnicianResults.appendChild(button);

            });

            ticketAssignedTechnicianResults.style.display = "block";

        } catch (error) {

            console.error("Technician search failed:", error);

        }

    }

    // Save Changes

    async function saveChanges(showAlert = true) {

    if (
        ticketAssignedDepartment.value.trim() !== "" &&
        assignedDepartmentId === null
    ) {

        alert("Please select a valid assigned department.");
        ticketAssignedDepartment.focus();
        return false;

    }

    if (
        ticketAssignedTechnician.value.trim() !== "" &&
        assignedTechnicianId === null
    ) {

        alert("Please select a valid assigned technician.");
        ticketAssignedTechnician.focus();
        return false;

    }

    if (ticketAssignedDepartment.value.trim() !== "" &&
        ticketAssignedTechnician.value.trim() === "") {

            alert("Please assign a technician.");
            ticketAssignedTechnician.focus();
            return false;

        }

    const updatedTicket = {

        assignedToUserId: assignedTechnicianId,
        assignedDepartmentId: assignedDepartmentId,

        category: ticketCategory.value,
        priority: ticketPriority.value,
        subject: ticketSubject.value,
        description: ticketDescription.value,
        status: ticketStatus.value

    };

    try {

        const response = await fetch(
            `/api/tickets/${encodeURIComponent(ticketId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(updatedTicket)
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.error ||
                "Failed to save ticket changes."
            );

            return false;
        }

        // Publish current worknote, if there is one

        const worknoteSaved =
            await publishWorknote(false);

        if (!worknoteSaved) {

            alert(
                "Ticket changes were saved, but the worknote could not be published."
            );

            await loadCurrentTicket();

            return false;
        }

        if (showAlert) {
            alert("Ticket changes saved.");
        }

        ticketHasUnsavedChanges = false;

        await loadCurrentTicket();

        return true;

    } catch (error) {

        console.error(
            "Failed to save ticket:",
            error
        );

        alert("Unable to connect to the server.");

        return false;
    }
}

    // Cancel Changes

    async function cancelChanges() {

        const confirmCancel =
            confirm("Do you want to remove all changes?");

        if (confirmCancel) {
            await loadCurrentTicket();
        }

    }

    // Resolve Ticket

    async function resolveTicket() {

        ticketStatus.value = "resolved";

        const saved =
            await saveChanges(false);

        if (saved) {
            lockTicket();
        }

    }

    // Re-open Ticket

    async function reopenTicket() {

        ticketStatus.value = "in-progress";

        const saved =
            await saveChanges(false);

        if (saved) {
            unlockTicket();
        }

    }

    // Publish Worknote

    async function publishWorknote(showAlert = true) {

        const note = ticketWorknotes.value.trim();

        // Nothing to publish
        if (note === "") {
            return true;
        }

        try {

            const response = await fetch(

                `/api/tickets/${encodeURIComponent(ticketId)}/worknotes`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({note: note})
                }

            );

            const data = await response.json();

            if (!response.ok) {

                if (showAlert) {
                    alert(data.error || "Failed to publish worknote.");
                }

                return false;

            }

            // Clear worknotes textarea
            ticketWorknotes.value = "";

            // Refresh worknotes history
            await loadWorknoteHistory();

            ticketHasUnsavedChanges = false;

            if (showAlert) {
                alert("Worknote published.");
            }

            return true;

        } catch (error) {

            console.error("Failed to publish worknote:", error);
            if (showAlert) {
                alert("Unable to connect to the server.");
            }

            return false;

        }

    }

    // Load Ticket

    loadCurrentTicket();

    //Side Bar

    initializeSidebarAccount();

    // Event Listeners

    ticketSaveChangesButton.addEventListener("click",function() {saveChanges(true);});
    ticketCancelButton.addEventListener("click",cancelChanges);
    ticketResolveButton.addEventListener("click",resolveTicket);
    ticketReopenButton.addEventListener("click",reopenTicket);
    publishWorknoteButton.addEventListener("click",publishWorknote);
    ticketAssignedDepartment.addEventListener("input", searchAssignedDepartment);
    ticketAssignedTechnician.addEventListener("input", searchAssignedTechician);

    // User tries to exit without saving changes

    const ticketEditableFields = [
        ticketAssignedDepartment,
        ticketAssignedTechnician,
        ticketCategory,
        ticketPriority,
        ticketStatus,
        ticketSubject,
        ticketDescription
    ];

    ticketEditableFields.forEach(function(field) {

        if (!field) {
            return;
        }

        field.addEventListener("change", function() {
            ticketHasUnsavedChanges = true;
        });

        field.addEventListener("input", function() {
            ticketHasUnsavedChanges = true;
        });

    });

    // Worknote changes

    ticketWorknotes.addEventListener("input", function() {

        if (ticketWorknotes.value.trim() !== "") {
            ticketHasUnsavedChanges = true;
        }

    });

    // Browser exit / refresh / back warning

    window.addEventListener(
        "beforeunload", function(event) {
            if (!ticketHasUnsavedChanges) {
                return;
            }
            
            event.preventDefault();
            event.returnValue = "";
        }
    );


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

    function getTicketDateValue (createdAt) {

        if (!createdAt) {
            return "";
        }

        const date = new Date(createdAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }

    // Getting tickets from API

    async function getTicketsFromAPI() {

        try {

            const response = await fetch("api/tickets", {
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to retrieve tickets.");
            }

            const tickets = await response.json();

            return tickets.map(function (ticket) {

                return {

                    ticketId: ticket.ticket_id,
                    ticketNumber: ticket.ticket_number,
                    user: ticket.requester,
                    employeeNumber: ticket.employee_number,
                    employeeEmail: ticket.email,
                    employeeJobTitle: ticket.job_title,
                    category: ticket.category,
                    priority: ticket.priority,
                    subject: ticket.subject,
                    description: ticket.description,
                    status: ticket.status,
                    assignedTo: ticket.assigned_to || "",
                    assignedDepartment: ticket.assigned_department || "",
                    worknotes: "",
                    createdDate: new Date(ticket.created_at).toLocaleDateString(),
                    createdDateValue: getTicketDateValue(ticket.created_at),
                    resolvedDate: ticket.resolved_at

                };

            });

        } catch (error) {
            console.error("Failed to load tickets:", error);
            return [];
        }

    }

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
            ticketNumber.href = `ticket-main-page.html?id=${ticket.ticketId}`;

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

    async function applyFilters() {

        const tickets = await getTicketsFromAPI();

        const filteredTickets = tickets.filter(function(ticket) {

            const ticketNumberMatch = ticket.ticketNumber.toLowerCase().includes(ticketNumberFilter.value.toLowerCase());
            const userMatch = ticket.user.toLowerCase().includes(userFilter.value.toLowerCase());
            const departmentMatch = ticket.assignedDepartment.toLowerCase().includes(departmentFilter.value.toLowerCase());
            const technicianMatch = dashboardFilter === "unassigned" 
                ? !ticket.assignedTo 
                : ticket.assignedTo.toLowerCase().includes(technicianFilter.value.toLowerCase());
            const priorityMatch = priorityFilter.value === "" || ticket.priority === priorityFilter.value;
            const statusMatch = statusFilter.value === "" || ticket.status === statusFilter.value;
            const dateMatch = dateFilter.value === "" || ticket.createdDateValue === dateFilter.value;
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

    async function clearFilters() {

        ticketNumberFilter.value = "";
        userFilter.value = "";
        departmentFilter.value = "";
        technicianFilter.value = "";
        priorityFilter.value = "";
        statusFilter.value = "";
        dateFilter.value = "";
        categoryFilter.value = "";

        loadTicketList(await getTicketsFromAPI());

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

    // Side Bar
    
    initializeSidebarAccount();

    // First landing page (no filters applied)

    applyFilters();

}

// ============================
//    Knowledge Base Scripts
// ============================

if (knowledgeBasePage) {


    const knowledgeBaseSearch = document.getElementById("search-bar");
    const knowledgeBaseCategoryCards = document.querySelectorAll(".card-knowledge-base");
    const knowledgeBaseArticleList = document.getElementById("main-knowledge-base-article-list");

    let selectedCategories = [];
    let knowledgeBaseUserRole = null;

    // Load KB articles from API

    async function getKnowledgeBaseArticles() {

        try {

            const response = await fetch("/api/knowledge-base", 
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to retrieve knowledge base articles.");
            }

            return await response.json();

        } catch (error) {

            console.error("Failed to load knowledge base articles:", error);
            return [];

        }

    }


    // Display KB articles

    function loadKnowledgeBaseArticles(articles) {

        knowledgeBaseArticleList.innerHTML = "";

        if(articles.length === 0) {

            const noResults = document.createElement("div");
            noResults.classList.add("knowledge-base-no-results");
            noResults.textContent = "No articles found.";
            knowledgeBaseArticleList.appendChild(noResults);
            
            return;

        }

        articles.forEach(function(article) {

            const articleCard = document.createElement("div");
            articleCard.classList.add("knowledge-base-article");

            // Open article

            articleCard.addEventListener("click", function() {
                window.location.href = `knowledge-base-article-main-page.html?id=${article.article_id}`;
            });

            // Title

            const articleTitle = document.createElement("h3");
            articleTitle.textContent = article.title;

            // Category

            const articleCategory = document.createElement("span");
            articleCategory.textContent = article.category;

            // Content preview

            const articleDescription = document.createElement("p");
            articleDescription.textContent = article.content.problem;

            articleCard.appendChild(articleTitle);
            articleCard.appendChild(articleCategory);
            articleCard.appendChild(articleDescription);
            knowledgeBaseArticleList.appendChild(articleCard);

            if (knowledgeBaseUserRole === "admin") {

                const managementButtons = document.createElement("div");
                managementButtons.classList.add("knowledge-base-article-management");

                // Edit button

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.classList.add("knowledge-base-article-edit");
                editButton.innerHTML = '<i data-lucide="pencil"></i>Edit';
                editButton.addEventListener("click", function(event) {
                    event.stopPropagation();
                    window.location.href = `knowledge-base-manage.html?id=${article.article_id}`;
                });


                // Delete button

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.classList.add("knowledge-base-article-delete");
                deleteButton.innerHTML = '<i data-lucide="trash-2"></i>Delete';
                deleteButton.addEventListener("click", async function(event) {

                    event.stopPropagation();
                    const confirmDelete = confirm(`Delete "${article.title}"?`);
                    if (!confirmDelete) {
                        return;
                    }

                    try {

                        const response = await fetch(`/api/knowledge-base/${article.article_id}`,
                            {
                                method: "DELETE",
                                credentials: "include"
                            }
                        );

                        const data = await response.json();

                        if (!response.ok) {

                            alert(data.error || "Failed to delete article.");
                            return;

                        }

                        alert("Article deleted successfully.");

                        // Reload KB data

                        knowledgeBaseArticles = await getKnowledgeBaseArticles();
                        updateCategoryCounts();
                        searchKnowledgeBase();

                    } catch (error) {

                        console.error("Failed to delete article:", error);
                        alert("Unable to connect to the server.");

                    }

                });

                managementButtons.appendChild(editButton);
                managementButtons.appendChild(deleteButton);
                articleCard.appendChild(managementButtons);

            }
            
            knowledgeBaseArticleList.appendChild(articleCard);

        });

        lucide.createIcons();

    }

    // Search and Filter

    function searchKnowledgeBase() {

        const searchText = knowledgeBaseSearch.value.trim().toLowerCase();
        const filteredArticles = knowledgeBaseArticles.filter(
            
            function(article) {

                const searchMatch = getKnowledgeBaseSearchText(article).includes(searchText);

                const categoryMatch = selectedCategories.length === 0 ||
                    selectedCategories.includes(article.category);

                return (
                    searchMatch && categoryMatch
                );

            }

        );

        loadKnowledgeBaseArticles(filteredArticles);

    }

    function getKnowledgeBaseSearchText(article) {

        return [
            article.title || "",
            article.category || "",
            article.content?.problem || "",
            ...(article.content?.causes || []),
            ...(article.content?.steps || []),
            article.content?.resolution || ""
        ].join(" ").toLowerCase();

    }

    // Update category counts

    function updateCategoryCounts() {

        knowledgeBaseCategoryCards.forEach(

            function(card) {

                const category = card.dataset.category;
                const count = knowledgeBaseArticles.filter(

                    function(article) {
                        return(article.category === category);
                    }

                ).length;

                const countElement = card.querySelector("p");
                countElement.textContent = count;

            }

        );


    }

    // Initialize Knowledge Base

    async function initializeKnowledgeBase() {

        const technicianSidebar = document.getElementById("technician-sidebar-navigation");
        const employeeSidebar = document.getElementById("employee-sidebar-navigation");
        technicianSidebar.style.display = "none";
        employeeSidebar.style.display = "none";

        try {

            const response = await fetch(
                "/api/me",
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to retrieve current user."
                );
            }

            const data = await response.json();

            knowledgeBaseUserRole =
                data.role;


            if (data.role === "employee") {

                employeeSidebar.style.display =
                    "block";

            } else if (
                data.role === "technician" ||
                data.role === "admin"
            ) {

                technicianSidebar.style.display =
                    "block";

            }

            // Create Article button

            const createArticleButton =
                document.getElementById(
                    "knowledge-base-create-article-button"
                );

            createArticleButton.style.display =
                data.role === "admin"
                    ? "flex"
                    : "none";

        } catch (error) {

            console.error(
                "Failed to check user role:",
                error
            );

        }

        knowledgeBaseArticles = await getKnowledgeBaseArticles();

        try {

            const response = await fetch ("/api/me", {
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                knowledgeBaseUserRole = data.role;
            }

        } catch (error) {
            console.error("Failed to check user role:", error);
        }

        updateCategoryCounts();
        loadKnowledgeBaseArticles(knowledgeBaseArticles);

        // Show or hide article button

        const createArticleButton = document.getElementById("knowledge-base-create-article-button");
        createArticleButton.style.display = 
            knowledgeBaseUserRole === "admin"
                ? "flex"
                : "none";

    }

    // Search

    knowledgeBaseSearch.addEventListener("input", function() {
        searchKnowledgeBase();
    });

    // Category filters

    knowledgeBaseCategoryCards.forEach(

        function(card) {

            card.addEventListener("click", function(event) {

                event.preventDefault();
                const category = card.dataset.category;

                if (selectedCategories.includes(category)) {

                    selectedCategories = selectedCategories.filter(function(selectedCategory) {

                        return (selectedCategory !== category);

                    });

                    card.classList.remove("active");

                } else {

                    selectedCategories.push(category);
                    card.classList.add("active");

                }

                searchKnowledgeBase();

            });

        }

    );

    // Start page

    initializeKnowledgeBase();

    //Side Bar

    initializeSidebarAccount();

}

// =========================================
//    Knowledge Base Article Page Scripts
// =========================================

if (knowledgeBaseArticlePage) {

    // Current article ID from URL

    const urlParameters = new URLSearchParams(window.location.search);
    const articleId = urlParameters.get("id");

    // HTML Elements

    const articleTitle = document.getElementById("knowledge-base-article-title");
    const articleCategory = document.getElementById("knowledge-base-article-category");
    const articleDate = document.getElementById("knowledge-base-article-date");
    const articleReadTime = document.getElementById("knowledge-base-article-read-time");
    const articleContent = document.getElementById("knowledge-base-article-content");
    const relatedArticlesContainer = document.getElementById("knowledge-base-related-articles");

    function initializeKnowledgeBaseSidebar() {

        const technicianSidebar =
            document.getElementById("technician-sidebar-navigation");

        const employeeSidebar =
            document.getElementById("employee-sidebar-navigation");

        technicianSidebar.style.display = "none";
        employeeSidebar.style.display = "none";

        fetch("/api/me", {
            credentials: "include"
        })
        .then(async function(response) {

            if (!response.ok) {
                throw new Error("Failed to retrieve current user.");
            }

            return await response.json();

        })
        .then(function(data) {

            if (data.role === "employee") {

                employeeSidebar.style.display = "block";

            } else if (
                data.role === "technician" ||
                data.role === "admin"
            ) {

                technicianSidebar.style.display = "block";

            }

        })
        .catch(function(error) {

            console.error(
                "Failed to initialize sidebar:",
                error
            );

        });

    }   
    
    // Display article not found

    function showArticleNotFound() {

        articleContent.innerHTML = "";
        const message = document.createElement("div");
        message.classList.add("knowledge-base-article-not-found");
        message.textContent = "Article not found.";
        articleContent.appendChild(message);

    }

    // Calculate estimated reading time

    function calculateReadTime(content) {

        let text = "";

        if (typeof content === "string") {

            text = content;

        } else if (content && typeof content === "object") {

            text = [
                content.problem || "",
                ...(content.causes || []),
                ...(content.steps || []),
                content.resolution || ""
            ].join(" ");

        }

        const words =
            text
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .length;

        const minutes =
            Math.max(1, Math.ceil(words / 200));

        return `${minutes} min read`;
    }

    // Display article content

    function loadArticleContent(content) {

        articleContent.innerHTML = "";

        // Article Problem

        const problemTitle = document.createElement("h2");
        problemTitle.innerHTML =
            '<i data-lucide="triangle-alert"></i> Problem';

        const problemText = document.createElement("p");
        problemText.textContent = content.problem;

        articleContent.appendChild(problemTitle);
        articleContent.appendChild(problemText);


        // Article Possible Causes

        const causesTitle = document.createElement("h2");
        causesTitle.innerHTML = '<i data-lucide="search"></i> Possible Causes';
        articleContent.appendChild(causesTitle);
        const causesList = document.createElement("ul");
        content.causes.forEach(function(cause) {

            const causeItem = document.createElement("li");
            causeItem.textContent = cause;
            causesList.appendChild(causeItem);

        });

        articleContent.appendChild(causesList);

        // Troubleshooting Steps

        const stepsTitle = document.createElement("h2");
        stepsTitle.innerHTML = '<i data-lucide="wrench"></i> Troubleshooting Steps';
        articleContent.appendChild(stepsTitle);
        const stepsList = document.createElement("ol");
        content.steps.forEach(function(step) {

            const stepItem = document.createElement("li");
            stepItem.textContent = step;
            stepsList.appendChild(stepItem);

        });

        articleContent.appendChild(stepsList);

        // Article Resolution

        const resolutionTitle = document.createElement("h2");
        resolutionTitle.innerHTML = '<i data-lucide="circle-check"></i> Resolution';
        const resolutionText = document.createElement("p");
        resolutionText.textContent = content.resolution;
        articleContent.appendChild(resolutionTitle);
        articleContent.appendChild(resolutionText);

    }

    // Load related articles

    async function loadRelatedArticles(currentArticle) {

        relatedArticlesContainer.innerHTML = "";

        try {

            const response = await fetch("/api/knowledge-base",
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to retrieve related articles.");
            }

            const articles = await response.json();
            const relatedArticles = articles.filter(function(article) {

                return (

                    article.category === currentArticle.category &&
                    article.article_id !== currentArticle.article_id

                );

            });

            if (relatedArticles.length === 0) {

                const noRelatedArticles = document.createElement("p");
                noRelatedArticles.textContent = "No related articles found.";
                relatedArticlesContainer.appendChild(noRelatedArticles);

                return;

            }

            relatedArticles.forEach(function(relatedArticle) {

                const relatedArticleLink = document.createElement("a");
                relatedArticleLink.href = `knowledge-base-article-main-page.html?id=${relatedArticle.article_id}`;
                relatedArticleLink.classList.add("knowledge-base-related-article");
                const relatedArticleTitle = document.createElement("h3");
                relatedArticleTitle.textContent = relatedArticle.title;
                const relatedArticleDescription = document.createElement("p");
                relatedArticleDescription.textContent = relatedArticle.content.problem;

                relatedArticleLink.appendChild(relatedArticleTitle);
                relatedArticleLink.appendChild(relatedArticleDescription);
                relatedArticlesContainer.appendChild(relatedArticleLink);

            });

        } catch (error) {

            console.error("Failed to load related articles:", error);
            const errorMessage = document.createElement("p");
            errorMessage.textContent = "Unable to load related articles.";
            relatedArticlesContainer.appendChild(errorMessage);
            
        }

    }

    // Load current article

    async function loadKnowledgeBaseArticle() {

        if (!articleId) {

            showArticleNotFound();
            return;

        }

        try {

            const response = await fetch (`/api/knowledge-base/${encodeURIComponent(articleId)}`,
                {
                    credentials: "include"
                }
        
            );

            if (!response.ok) {

                if (response.status === 404) {
                    showArticleNotFound();
                } else {
                    console.error("Failed to retrieve article.");
                }

                return;

            }

            const article = await response.json();
            
            // Article title

            articleTitle.textContent = article.title;

            // Article category

            articleCategory.textContent = article.category;

            // Updated date

            articleDate.textContent = "Updated " + new Date(article.updated_at).toLocaleDateString();

            // Reading time

            articleReadTime.textContent = calculateReadTime(article.content);

            // Article Content

            loadArticleContent(article.content);

            // Related articles

            await loadRelatedArticles(article);

            // Refresh Lucide icons

            lucide.createIcons();

        } catch (error) {

            console.error("Failed to load knowledge base article:", error);
            articleContent.innerHTML = "";
            const errorMessage = document.createElement("div");
            errorMessage.classList.add("knowledge-base-article-not-found");
            errorMessage.textContent = "Unable to load article.";
            articleContent.appendChild(errorMessage);

        }

    }

    // Load Knowledge Base Article

    loadKnowledgeBaseArticle();

    // Side Bar
    
    initializeSidebarAccount();

    // Employee Side Bar

    initializeKnowledgeBaseSidebar();

}

// ===================================
//    Knowledge Base Create Article
// ===================================

if (knowledgeBaseCreateArticlePage) {

    // HTML Elements

    const articlePageTitle = document.getElementById("knowledge-base-create-article-title");
    const articleTitleInput = document.getElementById("create-article-title");
    const articleCategoryInput = document.getElementById("create-article-category");
    const articleProblemInput = document.getElementById("create-article-problem");
    const articleCausesInput = document.getElementById("create-article-causes");
    const articleTroubleshootInput = document.getElementById("create-article-troubleshoot");
    const articleResolutionInput = document.getElementById("create-article-resolve");
    const cancelButton = document.getElementById("knowledge-base-create-article-cancel-button");
    const submitButton = document.getElementById("knowledge-base-create-article-submit-button");

    // Determine create or edit mode

    const urlParameters = new URLSearchParams(window.location.search);
    const articleId = urlParameters.get("id");
    const editMode = articleId !== null;

    // Convert textarea lines into an array

    function convertLinesToArray(value) {

        return value.split("\n").map(function(line) {
            return line.trim();
        }).filter(Boolean);

    }

    // Load article for edit mode

    async function loadArticleForEdit() {

        if (!editMode) {
            return;
        }

        try {

            const response = await fetch (`/api/knowledge-base/${encodeURIComponent(articleId)}`,
            {
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {

                alert(data.error || "Failed to load article.");
                window.location.href = "knowledge-base.html";
                return;

            }

            // Change page to edit mode

            articlePageTitle.textContent = "Edit Article";
            submitButton.innerHTML = '<i data-lucide="save"></i>Save Changes';

            // Fill form

            articleTitleInput.value = data.title || "";
            articleCategoryInput.value = data.category || "";
            articleProblemInput.value = data.content.problem || "";
            articleCausesInput.value = (data.content.causes || []).join("\n");
            articleTroubleshootInput.value = (data.content.steps || []).join("\n");
            articleResolutionInput.value = data.content.resolution ||"";

            lucide.createIcons();

        } catch (error) {

            console.error("Failed to load article for editing:", error);
            alert("Unable to connect to the server.");
            window.location.href("knowledge-base.html");

        }

    }

    // Create article / upload article

    async function saveKnowledgeBaseArticle() {

        const title = articleTitleInput.value.trim();
        const category = articleCategoryInput.value;
        const problem = articleProblemInput.value.trim();
        const causes = convertLinesToArray(articleCausesInput.value);
        const steps = convertLinesToArray(articleTroubleshootInput.value);
        const resolution = articleResolutionInput.value.trim();

        // Validation

        if (title === "") {
            alert("Enter an article title.");
            articleTitleInput.focus();
            return;
        }

        if (category === "") {
            alert("Select article category.");
            articleCategoryInput.focus();
            return;
        }

        if (problem === "") {
            alert("Describe the problem.");
            articleProblemInput.focus();
            return;
        }

        if (causes.length === 0) {
            alert("Enter at least one possible cause.");
            articleCausesInput.focus();
            return;
        }

        if (steps.length === 0) {
            alert("Enter atleast one troubleshooting step.");
            articleTroubleshootInput.focus();
            return;
        }

        if (resolution === "") {
            alert("Enter the article resolution.");
            articleResolutionInput.focus();
            return;
        }

        // Structured article content

        const content = {

            problem: problem,
            causes: causes,
            steps: steps,
            resolution: resolution

        };

        submitButton.disabled = true;
        submitButton.textContent = editMode ? "Saving..." : "Creating...";

        try {
            
            const url = editMode
                        ? `/api/knowledge-base/${encodeURIComponent(articleId)}`
                        : "/api/knowledge-base";

            const method = editMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    title: title,
                    category: category,
                    content: content
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error ||
                    (editMode
                        ? "Failed to update article."
                        : "Failed to create article."
                    )
                );
                return;
            }

            alert(
                editMode
                    ? "Knowledge Base article updated successfully."
                    : "Knowledge Base article created successfully.");
            window.location.href = "knowledge-base.html";

        } catch (error) {

            console.error(
                editMode
                    ? "Failed to update Knowledge Base article:"
                    : "Failed to create Knowledge Base article:", error);
            alert("Unable to connect to the server.");

        } finally {

            submitButton.disabled = false;
            
            if (editMode) {
                submitButton.innerHTML = '<i data-lucide="save"></i>Save Changes';
            } else {
                submitButton.innerHTML = '<i data-lucide="circle-plus"></i>Save Article';
            }

            lucide.createIcons();

        }

    }

    // Cancel

    function cancelKnowledgeBaseArticle() {

        const confirmCancel = confirm(
            editMode
                ? "Are you sure you want to cancel editing?"
                : "Are you sure you want to cancel?");
        if (!confirmCancel) {
            return;
        }

        window.location.href = "knowledge-base.html";

    }

    // Event listeners

    submitButton.addEventListener("click", saveKnowledgeBaseArticle);
    cancelButton.addEventListener("click", cancelKnowledgeBaseArticle);

    // Start edit mode

    loadArticleForEdit();

    //Side Bar

    initializeSidebarAccount();

}

// ============================
//    User Help Page Scripts
// ============================

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


    // Load Logged-in User

    async function loadHelpUser() {

        try {

            const response = await fetch(
                "/api/me",
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {

                window.location.href =
                    "index.html";

                return;
            }

            const user =
                await response.json();

            helpUsername.value =
                user.username;

            helpEmail.value =
                user.email;

        } catch (error) {

            console.error(
                "Failed to load user information:",
                error
            );

            alert(
                "Unable to load your account information."
            );

        }

    }


    // Submit Help Request

    async function submitHelpRequest() {

        const helpTicketSubject =
            helpSubject.value.trim();

        const helpTicketDescription =
            helpDescription.value.trim();


        // Validate Subject

        if (helpTicketSubject === "") {

            alert(
                "Enter summary of your issue before submitting."
            );

            helpSubject.focus();

            return;
        }


        // Validate Description

        if (helpTicketDescription === "") {

            alert(
                "Describe your issue before submitting."
            );

            helpDescription.focus();

            return;
        }


        helpSubmitButton.disabled = true;

        helpSubmitButton.innerHTML =
            '<i data-lucide="loader-circle"></i>Submitting...';

        lucide.createIcons();


        try {

            const response = await fetch(
                "/api/tickets",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        category: null,
                        priority: "low",
                        subject: helpTicketSubject,
                        description:
                            helpTicketDescription,

                        status: "open"

                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.error ||
                    "Failed to submit help request."
                );

                return;
            }

            // Display Success Message

            helpRequestForm.style.display =
                "none";

            helpSuccessMessage.style.display =
                "flex";


        } catch (error) {

            console.error(
                "Help request failed:",
                error
            );

            alert(
                "Unable to connect to the server."
            );

        } finally {

            helpSubmitButton.disabled = false;

            helpSubmitButton.innerHTML =
                '<i data-lucide="circle-plus"></i>Submit';

            lucide.createIcons();

        }

    }


    // Cancel

    function helpCancelTicket() {

        const confirmCancel =
            confirm(
                "Are you sure you want to cancel ticket creation?"
            );

        if (confirmCancel) {

            helpSubject.value = "";
            helpDescription.value = "";

        }

    }


    // Submit Another

    function helpCreateAnotherTicket() {

        helpSubject.value = "";
        helpDescription.value = "";

        helpSuccessMessage.style.display =
            "none";

        helpRequestForm.style.display =
            "flex";

        helpSubject.focus();

    }


    // Event Listeners

    helpSubmitButton.addEventListener(
        "click",
        submitHelpRequest
    );

    helpCancelButton.addEventListener(
        "click",
        helpCancelTicket
    );

    helpCreateAnotherButton.addEventListener(
        "click",
        helpCreateAnotherTicket
    );


    // Load User

    loadHelpUser();

    //Side Bar

    initializeSidebarAccount();

}

// ========================
//    About Page Scripts
// ========================

if (aboutPage) {

    const aboutContent = document.getElementById("about-readme-content");

    async function loadReadme() {

        try {

            const response = await fetch("/README.md");

            if (!response.ok) {
                throw new Error("Failed to load README.");
            }

            const markdown = await response.text();
            aboutContent.innerHTML = marked.parse(markdown);

        } catch (error) {

            console.error("Failed to load README:", error);
            aboutContent.textContent = "Unable to load project information.";

        }

    }

    loadReadme();

}