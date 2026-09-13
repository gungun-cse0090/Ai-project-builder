/* =========================================================
   AI PROJECT BUILDER - FRONTEND SCRIPT
   ========================================================= */

const API_BASE_URL = "http://localhost:5000/api";

const USER_STORAGE_KEY = "projectAIUser";
const PROJECTS_STORAGE_KEY = "projectAIProjects";

let currentUser = null;
let currentProject = null;
let currentBlueprint = null;
let currentVisualType = "architecture";

/* EDIT MODE */
let blueprintEditMode = false;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadCurrentUser();

    if (currentUser) {
        updateDashboardUser();
    }

    setupKeyboardEvents();
});


/* =========================================================
   USER STORAGE
   ========================================================= */

function saveCurrentUser(user) {

    currentUser = user;

    localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(user)
    );
}


function loadCurrentUser() {

    const savedUser =
        localStorage.getItem(USER_STORAGE_KEY);

    if (!savedUser) {
        currentUser = null;
        return;
    }

    try {

        currentUser =
            JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "User storage error:",
            error
        );

        localStorage.removeItem(
            USER_STORAGE_KEY
        );

        currentUser = null;
    }
}


function getCurrentUser() {

    return currentUser;
}


/* =========================================================
   LOGIN MODAL
   ========================================================= */

function openLogin() {

    const modal =
        document.getElementById(
            "loginModal"
        );

    if (!modal) {

        console.error(
            "loginModal not found."
        );

        return;
    }

    modal.style.display = "flex";
    modal.classList.add("active");
}


function closeLogin() {

    const modal =
        document.getElementById(
            "loginModal"
        );

    if (!modal) {
        return;
    }

    modal.style.display = "none";
    modal.classList.remove("active");
}


/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin() {

    const nameInput =
        document.getElementById(
            "loginName"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const password =
        passwordInput
            ? passwordInput.value
            : "";

    if (!name || !password) {

        showToast(
            "Please enter your name and password.",
            "error"
        );

        return;
    }

    const loginButton =
        document.querySelector(
            ".auth-btn"
        );

    if (loginButton) {

        loginButton.disabled = true;

        loginButton.innerHTML =
            "Logging in... <span>→</span>";
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        password: password
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Invalid name or password."
            );
        }

        saveCurrentUser(
            data.user
        );

        showToast(
            "Login successful!",
            "success"
        );

        closeLogin();

        clearLoginInputs();

        setTimeout(() => {

            openDashboard();

        }, 400);

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to connect to server.",
            "error"
        );

    } finally {

        if (loginButton) {

            loginButton.disabled = false;

            loginButton.innerHTML =
                "Login <span>→</span>";
        }
    }
}


/* =========================================================
   SIGNUP
   ========================================================= */

async function handleSignup() {

    const nameInput =
        document.getElementById(
            "loginName"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const password =
        passwordInput
            ? passwordInput.value
            : "";

    if (!name || !password) {

        showToast(
            "Please enter your name and password.",
            "error"
        );

        return;
    }

    if (password.length < 6) {

        showToast(
            "Password must be at least 6 characters.",
            "error"
        );

        return;
    }

    const signupButton =
        document.querySelector(
            ".auth-signup"
        );

    if (signupButton) {

        signupButton.disabled = true;

        signupButton.textContent =
            "Creating account...";
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/signup`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        password: password
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to create account."
            );
        }

        if (data.user) {

            saveCurrentUser(
                data.user
            );
        }

        showToast(
            "Account created successfully!",
            "success"
        );

        closeLogin();

        clearLoginInputs();

        setTimeout(() => {

            openDashboard();

        }, 400);

    } catch (error) {

        console.error(
            "Signup Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to create account.",
            "error"
        );

    } finally {

        if (signupButton) {

            signupButton.disabled = false;

            signupButton.textContent =
                "Create Account";
        }
    }
}


/* =========================================================
   CLEAR LOGIN INPUTS
   ========================================================= */

function clearLoginInputs() {

    const nameInput =
        document.getElementById(
            "loginName"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );

    if (nameInput) {
        nameInput.value = "";
    }

    if (passwordInput) {
        passwordInput.value = "";
    }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function openDashboard() {

    blueprintEditMode = false;

    const landing =
        document.getElementById(
            "landingPage"
        );

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    const builder =
        document.getElementById(
            "builder"
        );

    const blueprint =
        document.getElementById(
            "blueprintSection"
        );

    const visual =
        document.getElementById(
            "visualSection"
        );

    if (landing) {
        landing.style.display = "none";
    }

    if (dashboard) {
        dashboard.style.display = "block";
    }

    if (builder) {
        builder.style.display = "none";
    }

    if (blueprint) {
        blueprint.style.display = "none";
    }

    if (visual) {
        visual.style.display = "none";
    }

    updateDashboardUser();

    renderSavedProjects();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   UPDATE DASHBOARD USER
   ========================================================= */

function updateDashboardUser() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }

    const dashboardName =
        document.getElementById(
            "dashboardUserName"
        );

    const welcomeName =
        document.getElementById(
            "dashboardWelcomeName"
        );

    const avatar =
        document.getElementById(
            "dashboardAvatar"
        );

    if (dashboardName) {

        dashboardName.textContent =
            user.name;
    }

    if (welcomeName) {

        welcomeName.textContent =
            user.name;
    }

    if (avatar) {

        avatar.textContent =
            user.name
                .charAt(0)
                .toUpperCase();
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    localStorage.removeItem(
        USER_STORAGE_KEY
    );

    currentUser = null;
    currentProject = null;
    currentBlueprint = null;
    blueprintEditMode = false;

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    const landing =
        document.getElementById(
            "landingPage"
        );

    if (dashboard) {
        dashboard.style.display = "none";
    }

    if (landing) {
        landing.style.display = "block";
    }

    showToast(
        "Logged out successfully.",
        "success"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   BUILDER
   ========================================================= */

function openBuilder() {

    const user =
        getCurrentUser();

    if (!user) {

        openLogin();

        return;
    }

    blueprintEditMode = false;

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    const landing =
        document.getElementById(
            "landingPage"
        );

    const builder =
        document.getElementById(
            "builder"
        );

    const blueprint =
        document.getElementById(
            "blueprintSection"
        );

    const visual =
        document.getElementById(
            "visualSection"
        );

    if (landing) {
        landing.style.display = "none";
    }

    if (dashboard) {
        dashboard.style.display = "none";
    }

    if (builder) {
        builder.style.display = "block";
    }

    if (blueprint) {
        blueprint.style.display = "none";
    }

    if (visual) {
        visual.style.display = "none";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   CLEAR PROJECT IDEA
   ========================================================= */

function clearProjectIdea() {

    const input =
        document.getElementById(
            "projectIdea"
        );

    if (input) {

        input.value = "";

        input.focus();
    }
}


/* =========================================================
   GENERATE BLUEPRINT - REAL AI
   ========================================================= */

async function generateBlueprint() {

    const ideaInput =
        document.getElementById(
            "projectIdea"
        );

    if (!ideaInput) {

        showToast(
            "Project input not found.",
            "error"
        );

        return;
    }

    const idea =
        ideaInput.value.trim();

    if (!idea) {

        showToast(
            "Please enter your project idea first.",
            "error"
        );

        return;
    }

    const user =
        getCurrentUser();

    if (!user) {

        showToast(
            "Please login first.",
            "error"
        );

        openLogin();

        return;
    }

    const button =
        document.querySelector(
            "#builder .primary-btn"
        );

    if (button) {

        button.disabled = true;

        button.innerHTML =
            "Analyzing... <span>✦</span>";
    }

    try {

        console.log(
            "Sending project idea to AI:",
            idea
        );

        const response =
            await fetch(
                `${API_BASE_URL}/ai/generate-blueprint`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        idea: idea
                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "AI Blueprint Response:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to generate blueprint."
            );
        }

        if (!data.blueprint) {

            throw new Error(
                "AI did not return a blueprint."
            );
        }

        currentBlueprint =
            normalizeBlueprint(
                data.blueprint
            );

        currentProject = {

            id:
                Date.now().toString(),

            owner:
                user.id ||
                user._id,

            idea:
                idea,

            title:
                currentBlueprint.title,

            blueprint:
                currentBlueprint,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };

        blueprintEditMode = false;

        renderBlueprint(
            currentBlueprint
        );

        renderSuggestions(
            currentBlueprint
        );

        const builder =
            document.getElementById(
                "builder"
            );

        const blueprint =
            document.getElementById(
                "blueprintSection"
            );

        if (builder) {
            builder.style.display = "none";
        }

        if (blueprint) {
            blueprint.style.display = "block";
        }

        showToast(
            "AI blueprint generated successfully!",
            "success"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Blueprint Generation Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to generate blueprint.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =
                "Generate Blueprint <span>✦</span>";
        }
    }
}


/* =========================================================
   NORMALIZE AI BLUEPRINT
   ========================================================= */

function normalizeBlueprint(blueprint) {

    const normalized = {

        title:
            blueprint.title ||
            "AI Generated Software Project",

        description:
            blueprint.description ||
            "AI-generated software blueprint based on your project idea.",

        problemStatement:
            blueprint.problemStatement ||
            blueprint.problem ||
            "The proposed system addresses the problem described in the project idea.",

        objectives:
            Array.isArray(
                blueprint.objectives
            )
                ? blueprint.objectives
                : [],

        targetUsers:
            Array.isArray(
                blueprint.targetUsers
            )
                ? blueprint.targetUsers
                : [],

        coreFeatures:
            [],

        modules:
            Array.isArray(
                blueprint.modules
            )
                ? blueprint.modules
                : [],

        roles:
            Array.isArray(
                blueprint.roles
            )
                ? blueprint.roles
                : [],

        techStack:
            normalizeTechStack(
                blueprint.techStack
            ),

        apis:
            Array.isArray(
                blueprint.apis
            )
                ? blueprint.apis
                : [],

        database:
            Array.isArray(
                blueprint.database
            )
                ? blueprint.database
                : [],

        workflow:
            Array.isArray(
                blueprint.workflow
            )
                ? blueprint.workflow
                : [],

        aiSuggestions:
            Array.isArray(
                blueprint.suggestions
            )
                ? blueprint.suggestions
                : []
    };

    if (
        Array.isArray(
            blueprint.features
        )
    ) {

        normalized.coreFeatures =
            blueprint.features.map(
                (feature) => {

                    if (
                        typeof feature ===
                        "string"
                    ) {

                        return {

                            name:
                                feature,

                            description:
                                "AI-generated project feature."
                        };
                    }

                    return {

                        name:
                            feature.name ||
                            "Project Feature",

                        description:
                            feature.description ||
                            "AI-generated project feature."
                    };
                }
            );
    }

    return normalized;
}


/* =========================================================
   NORMALIZE TECH STACK
   ========================================================= */

function normalizeTechStack(stack) {

    if (!stack) {

        return {

            frontend: [],
            backend: [],
            database: [],
            ai: []
        };
    }

    if (Array.isArray(stack)) {

        const result = {

            frontend: [],
            backend: [],
            database: [],
            ai: []
        };

        stack.forEach(
            (technology) => {

                const value =
                    String(technology);

                const lower =
                    value.toLowerCase();

                if (
                    lower.includes("react") ||
                    lower.includes("html") ||
                    lower.includes("css") ||
                    lower.includes("frontend") ||
                    lower.includes("typescript") ||
                    lower.includes("javascript") ||
                    lower.includes("bootstrap") ||
                    lower.includes("tailwind") ||
                    lower.includes("material ui")
                ) {

                    result.frontend.push(
                        value
                    );

                } else if (
                    lower.includes("node") ||
                    lower.includes("express") ||
                    lower.includes("django") ||
                    lower.includes("flask") ||
                    lower.includes("backend") ||
                    lower.includes("server")
                ) {

                    result.backend.push(
                        value
                    );

                } else if (
                    lower.includes("mongo") ||
                    lower.includes("mysql") ||
                    lower.includes("postgres") ||
                    lower.includes("database") ||
                    lower.includes("sql") ||
                    lower.includes("prisma") ||
                    lower.includes("redis")
                ) {

                    result.database.push(
                        value
                    );

                } else if (
                    lower.includes("openai") ||
                    lower.includes("artificial intelligence") ||
                    lower.includes("ai") ||
                    lower.includes("machine learning") ||
                    lower.includes("ml") ||
                    lower.includes("model")
                ) {

                    result.ai.push(
                        value
                    );

                } else {

                    result.backend.push(
                        value
                    );
                }
            }
        );

        return result;
    }

    return {

        frontend:
            Array.isArray(
                stack.frontend
            )
                ? stack.frontend
                : [],

        backend:
            Array.isArray(
                stack.backend
            )
                ? stack.backend
                : [],

        database:
            Array.isArray(
                stack.database
            )
                ? stack.database
                : [],

        ai:
            Array.isArray(
                stack.ai
            )
                ? stack.ai
                : []
    };
}


/* =========================================================
   RENDER BLUEPRINT
   ========================================================= */

function renderBlueprint(blueprint) {

    if (!blueprint) {
        return;
    }

    const title =
        document.getElementById(
            "blueprintTitle"
        );

    const description =
        document.getElementById(
            "blueprintDescription"
        );

    const problem =
        document.getElementById(
            "blueprintProblem"
        );

    if (title) {

        title.textContent =
            blueprint.title;
    }

    if (description) {

        description.textContent =
            blueprint.description ||
            "AI-generated software blueprint based on your project idea.";
    }

    if (problem) {

        problem.textContent =
            blueprint.problemStatement;
    }

    renderTags(
        "blueprintObjectives",
        blueprint.objectives
    );

    renderTags(
        "blueprintUsers",
        blueprint.targetUsers
    );

    renderFeatures(
        blueprint.coreFeatures
    );

    renderTags(
        "blueprintModules",
        blueprint.modules
    );

    renderTechStack(
        blueprint.techStack
    );

    renderTags(
        "blueprintAPI",
        blueprint.apis
    );

    renderTags(
        "blueprintDatabase",
        blueprint.database
    );

    if (blueprintEditMode) {
        activateBlueprintEditing();
    }
}


/* =========================================================
   RENDER TAGS
   ========================================================= */

function renderTags(
    containerId,
    items
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        container.innerHTML =
            "<span>No information available.</span>";

        return;
    }

    items.forEach(
        (item) => {

            const tag =
                document.createElement(
                    "span"
                );

            tag.className =
                "blueprint-tag";

            tag.textContent =
                typeof item === "string"
                    ? item
                    : JSON.stringify(item);

            container.appendChild(
                tag
            );
        }
    );
}


/* =========================================================
   RENDER FEATURES
   ========================================================= */

function renderFeatures(features) {

    const container =
        document.getElementById(
            "blueprintFeatures"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !Array.isArray(features) ||
        features.length === 0
    ) {

        container.innerHTML =
            "<p>No features available.</p>";

        const featureList =
            document.getElementById(
                "featureList"
            );

        if (featureList) {
            featureList.innerHTML = "";
        }

        return;
    }

    features.forEach(
        (feature, index) => {

            const safeName =
                typeof feature === "string"
                    ? feature
                    : feature.name ||
                      "Project Feature";

            const safeDescription =
                typeof feature === "string"
                    ? "AI-generated project feature."
                    : feature.description ||
                      "AI-generated project feature.";

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "blueprint-feature";

            card.innerHTML = `

                <div>

                    <h4>
                        ${escapeHTML(
                            safeName
                        )}
                    </h4>

                    <p>
                        ${escapeHTML(
                            safeDescription
                        )}
                    </p>

                </div>

                <button
                    type="button"
                    onclick="removeFeature(${index})"
                >
                    ×
                </button>

            `;

            container.appendChild(
                card
            );
        }
    );

    const featureList =
        document.getElementById(
            "featureList"
        );

    if (featureList) {

        featureList.innerHTML = "";

        features.forEach(
            (feature, index) => {

                const safeName =
                    typeof feature === "string"
                        ? feature
                        : feature.name ||
                          "Project Feature";

                const safeDescription =
                    typeof feature === "string"
                        ? "AI-generated project feature."
                        : feature.description ||
                          "AI-generated project feature.";

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "feature-item";

                item.innerHTML = `

                    <div>

                        <strong>
                            ${escapeHTML(
                                safeName
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                safeDescription
                            )}
                        </p>

                    </div>

                    <button
                        type="button"
                        onclick="removeFeature(${index})"
                    >
                        ×
                    </button>

                `;

                featureList.appendChild(
                    item
                );
            }
        );
    }

    if (blueprintEditMode) {
        makeFeaturesEditable();
    }
}


/* =========================================================
   ADD FEATURE
   ========================================================= */

function addFeature() {

    if (!currentBlueprint) {

        showToast(
            "Generate a blueprint first.",
            "error"
        );

        return;
    }

    /*
       IMPORTANT:
       Capture anything currently being edited
       before re-rendering the feature list.
    */

    if (blueprintEditMode) {
        captureEditableBlueprint();
    }

    const input =
        document.getElementById(
            "newFeatureInput"
        );

    if (!input) {
        return;
    }

    const featureName =
        input.value.trim();

    if (!featureName) {

        showToast(
            "Please enter a feature name.",
            "error"
        );

        return;
    }

    currentBlueprint.coreFeatures.push({

        name:
            featureName,

        description:
            "Custom feature added by the user."
    });

    input.value = "";

    renderFeatures(
        currentBlueprint.coreFeatures
    );

    if (blueprintEditMode) {
        makeFeaturesEditable();
    }

    showToast(
        "Feature added successfully!",
        "success"
    );
}


/* =========================================================
   REMOVE FEATURE
   ========================================================= */

function removeFeature(index) {

    if (!currentBlueprint) {
        return;
    }

    /*
       Save current text edits before deleting.
    */

    if (blueprintEditMode) {
        captureEditableBlueprint();
    }

    if (
        !Array.isArray(
            currentBlueprint.coreFeatures
        ) ||
        index < 0 ||
        index >=
            currentBlueprint.coreFeatures.length
    ) {
        return;
    }

    currentBlueprint.coreFeatures.splice(
        index,
        1
    );

    renderFeatures(
        currentBlueprint.coreFeatures
    );

    if (blueprintEditMode) {
        makeFeaturesEditable();
    }

    showToast(
        "Feature removed.",
        "success"
    );
}


/* =========================================================
   EDIT BLUEPRINT
   ========================================================= */

function editBlueprint() {

    if (!currentBlueprint) {

        showToast(
            "No blueprint available.",
            "error"
        );

        return;
    }

    blueprintEditMode = true;

    activateBlueprintEditing();

    const landing =
        document.getElementById(
            "landingPage"
        );

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    const builder =
        document.getElementById(
            "builder"
        );

    const blueprint =
        document.getElementById(
            "blueprintSection"
        );

    const visual =
        document.getElementById(
            "visualSection"
        );

    if (landing) {
        landing.style.display = "none";
    }

    if (dashboard) {
        dashboard.style.display = "none";
    }

    if (builder) {
        builder.style.display = "none";
    }

    if (visual) {
        visual.style.display = "none";
    }

    if (blueprint) {
        blueprint.style.display = "block";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    showToast(
        "Edit mode enabled. Click any highlighted text to edit.",
        "success"
    );
}


/* =========================================================
   ACTIVATE BLUEPRINT EDITING
   ========================================================= */

function activateBlueprintEditing() {

    const editableElements = [

        document.getElementById(
            "blueprintTitle"
        ),

        document.getElementById(
            "blueprintDescription"
        ),

        document.getElementById(
            "blueprintProblem"
        )
    ];

    editableElements.forEach(
        (element) => {

            if (!element) {
                return;
            }

            element.contentEditable = "true";

            element.dataset.editable =
                "true";

            styleEditableElement(
                element
            );
        }
    );


    /* TAG SECTIONS */

    makeTagsEditable(
        "blueprintObjectives"
    );

    makeTagsEditable(
        "blueprintUsers"
    );

    makeTagsEditable(
        "blueprintModules"
    );

    makeTagsEditable(
        "blueprintAPI"
    );

    makeTagsEditable(
        "blueprintDatabase"
    );

    makeTagsEditable(
        "blueprintTech"
    );


    /* FEATURES */

    makeFeaturesEditable();
}


/* =========================================================
   STYLE EDITABLE ELEMENT
   ========================================================= */

function styleEditableElement(element) {

    element.style.outline =
        "1px solid rgba(140, 120, 255, 0.55)";

    element.style.borderRadius =
        "8px";

    element.style.padding =
        "4px 7px";

    element.style.cursor =
        "text";

    element.style.background =
        "rgba(120, 100, 255, 0.06)";
}


/* =========================================================
   MAKE TAGS EDITABLE
   ========================================================= */

function makeTagsEditable(containerId) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return;
    }

    const tags =
        container.querySelectorAll(
            ".blueprint-tag"
        );

    tags.forEach(
        (tag) => {

            tag.contentEditable =
                "true";

            tag.dataset.editable =
                "true";

            styleEditableElement(
                tag
            );
        }
    );
}


/* =========================================================
   MAKE FEATURES EDITABLE
   ========================================================= */

function makeFeaturesEditable() {

    const container =
        document.getElementById(
            "blueprintFeatures"
        );

    if (!container) {
        return;
    }

    const featureCards =
        container.querySelectorAll(
            ".blueprint-feature"
        );

    featureCards.forEach(
        (card) => {

            const title =
                card.querySelector(
                    "h4"
                );

            const description =
                card.querySelector(
                    "p"
                );

            if (title) {

                title.contentEditable =
                    "true";

                title.dataset.editable =
                    "true";

                styleEditableElement(
                    title
                );
            }

            if (description) {

                description.contentEditable =
                    "true";

                description.dataset.editable =
                    "true";

                styleEditableElement(
                    description
                );
            }
        }
    );
}


/* =========================================================
   READ EDITABLE TAGS
   ========================================================= */

function readEditableTags(containerId) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return [];
    }

    const tags =
        container.querySelectorAll(
            ".blueprint-tag"
        );

    return Array.from(tags)

        .map(
            (tag) =>
                tag.innerText.trim()
        )

        .filter(
            (value) =>
                value.length > 0
        );
}


/* =========================================================
   CAPTURE EDITABLE BLUEPRINT
   ========================================================= */

function captureEditableBlueprint() {

    if (!currentBlueprint) {
        return;
    }


    /* TITLE */

    const title =
        document.getElementById(
            "blueprintTitle"
        );

    if (title) {

        const value =
            title.innerText.trim();

        if (value) {
            currentBlueprint.title =
                value;
        }
    }


    /* DESCRIPTION */

    const description =
        document.getElementById(
            "blueprintDescription"
        );

    if (description) {

        currentBlueprint.description =
            description.innerText.trim();
    }


    /* PROBLEM */

    const problem =
        document.getElementById(
            "blueprintProblem"
        );

    if (problem) {

        currentBlueprint.problemStatement =
            problem.innerText.trim();
    }


    /* OBJECTIVES */

    currentBlueprint.objectives =
        readEditableTags(
            "blueprintObjectives"
        );


    /* USERS */

    currentBlueprint.targetUsers =
        readEditableTags(
            "blueprintUsers"
        );


    /* MODULES */

    currentBlueprint.modules =
        readEditableTags(
            "blueprintModules"
        );


    /* APIS */

    currentBlueprint.apis =
        readEditableTags(
            "blueprintAPI"
        );


    /* DATABASE */

    currentBlueprint.database =
        readEditableTags(
            "blueprintDatabase"
        );


    /* TECH STACK */

    const techValues =
        readEditableTags(
            "blueprintTech"
        );

    currentBlueprint.techStack =
        normalizeTechStack(
            techValues
        );


    /* FEATURES */

    const featureContainer =
        document.getElementById(
            "blueprintFeatures"
        );

    if (featureContainer) {

        const cards =
            featureContainer.querySelectorAll(
                ".blueprint-feature"
            );

        currentBlueprint.coreFeatures =
            Array.from(cards)
                .map(
                    (card) => {

                        const nameElement =
                            card.querySelector(
                                "h4"
                            );

                        const descriptionElement =
                            card.querySelector(
                                "p"
                            );

                        return {

                            name:
                                nameElement
                                    ? nameElement.innerText.trim()
                                    : "Project Feature",

                            description:
                                descriptionElement
                                    ? descriptionElement.innerText.trim()
                                    : "Project feature."
                        };
                    }
                )
                .filter(
                    (feature) =>
                        feature.name.length > 0
                );
    }
}


/* =========================================================
   DISABLE BLUEPRINT EDITING
   ========================================================= */

function disableBlueprintEditing() {

    const elements =
        document.querySelectorAll(
            '[data-editable="true"]'
        );

    elements.forEach(
        (element) => {

            element.contentEditable =
                "false";

            element.removeAttribute(
                "data-editable"
            );

            element.style.outline =
                "";

            element.style.borderRadius =
                "";

            element.style.padding =
                "";

            element.style.cursor =
                "";

            element.style.background =
                "";
        }
    );

    blueprintEditMode = false;
}


/* =========================================================
   SUGGESTIONS
   ========================================================= */

function generateSuggestions(
    blueprint
) {

    const suggestions = [];

    if (!blueprint) {
        return suggestions;
    }

    const featureNames =
        (blueprint.coreFeatures || [])
            .map(
                (feature) => {

                    const name =
                        typeof feature === "string"
                            ? feature
                            : feature.name || "";

                    return name.toLowerCase();
                }
            );

    if (
        !featureNames.some(
            (name) =>
                name.includes("analytics")
        )
    ) {

        suggestions.push({

            title:
                "Analytics Dashboard",

            description:
                "Add charts and statistics to help users understand system activity."
        });
    }

    if (
        !featureNames.some(
            (name) =>
                name.includes("search")
        )
    ) {

        suggestions.push({

            title:
                "Advanced Search",

            description:
                "Allow users to quickly search and filter important information."
        });
    }

    if (
        !featureNames.some(
            (name) =>
                name.includes("feedback")
        )
    ) {

        suggestions.push({

            title:
                "Feedback System",

            description:
                "Allow users to submit feedback and suggestions."
        });
    }

    if (
        !featureNames.some(
            (name) =>
                name.includes("notification")
        )
    ) {

        suggestions.push({

            title:
                "Smart Notifications",

            description:
                "Send useful alerts and updates to users automatically."
        });
    }

    return suggestions;
}


/* =========================================================
   GET AI / FALLBACK SUGGESTIONS
   ========================================================= */

function getBlueprintSuggestions(
    blueprint
) {

    if (
        blueprint &&
        Array.isArray(
            blueprint.aiSuggestions
        ) &&
        blueprint.aiSuggestions.length
    ) {

        return blueprint.aiSuggestions.map(
            (item) => {

                if (
                    typeof item === "string"
                ) {

                    return {

                        title:
                            item,

                        description:
                            "AI-recommended improvement for this project."
                    };
                }

                return {

                    title:
                        item.title ||
                        item.name ||
                        "AI Suggestion",

                    description:
                        item.description ||
                        "AI-recommended improvement for this project."
                };
            }
        );
    }

    return generateSuggestions(
        blueprint
    );
}


/* =========================================================
   RENDER SUGGESTIONS
   ========================================================= */

function renderSuggestions(
    blueprint
) {

    const container =
        document.getElementById(
            "blueprintSuggestions"
        );

    if (!container) {
        return;
    }

    const suggestions =
        getBlueprintSuggestions(
            blueprint
        );

    container.innerHTML = "";

    if (!suggestions.length) {

        container.innerHTML =
            "<p>No suggestions available.</p>";

        return;
    }

    suggestions.forEach(
        (suggestion, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "suggestion-card";

            card.innerHTML = `

                <div>

                    <h4>
                        ${escapeHTML(
                            suggestion.title
                        )}
                    </h4>

                    <p>
                        ${escapeHTML(
                            suggestion.description
                        )}
                    </p>

                </div>

                <button
                    type="button"
                    onclick="applySuggestion(${index})"
                >
                    Add
                </button>

            `;

            container.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   APPLY SUGGESTION
   ========================================================= */

function applySuggestion(index) {

    if (!currentBlueprint) {
        return;
    }

    if (blueprintEditMode) {
        captureEditableBlueprint();
    }

    const suggestions =
        getBlueprintSuggestions(
            currentBlueprint
        );

    const suggestion =
        suggestions[index];

    if (!suggestion) {
        return;
    }

    currentBlueprint.coreFeatures.push({

        name:
            suggestion.title,

        description:
            suggestion.description
    });

    if (
        Array.isArray(
            currentBlueprint.aiSuggestions
        )
    ) {

        currentBlueprint.aiSuggestions =
            currentBlueprint.aiSuggestions.filter(
                (item) => {

                    const title =
                        typeof item === "string"
                            ? item
                            : (
                                item.title ||
                                item.name ||
                                ""
                            );

                    return title !==
                        suggestion.title;
                }
            );
    }

    renderFeatures(
        currentBlueprint.coreFeatures
    );

    renderSuggestions(
        currentBlueprint
    );

    if (blueprintEditMode) {
        makeFeaturesEditable();
    }

    showToast(
        "AI suggestion added!",
        "success"
    );
}


/* =========================================================
   UPDATE BLUEPRINT
   ========================================================= */

function updateBlueprint() {

    if (!currentBlueprint) {

        showToast(
            "No blueprint available.",
            "error"
        );

        return;
    }

    /*
       FIRST:
       Read everything the user changed
       from the editable DOM.
    */

    if (blueprintEditMode) {
        captureEditableBlueprint();
    }


    /* Update current project */

    if (currentProject) {

        currentProject.blueprint =
            currentBlueprint;

        currentProject.updatedAt =
            new Date().toISOString();

        currentProject.title =
            currentBlueprint.title;

        currentProject.idea =
            currentProject.idea ||
            currentBlueprint.title;

        /* LocalStorage backup */

        saveProject(
            currentProject
        );
    }


    /* Turn edit mode OFF */

    disableBlueprintEditing();


    /* Re-render clean blueprint */

    renderBlueprint(
        currentBlueprint
    );

    renderSuggestions(
        currentBlueprint
    );


    showToast(
        "Blueprint updated successfully!",
        "success"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   TECHNOLOGY STACK
   ========================================================= */

function renderTechStack(stack) {

    const container =
        document.getElementById(
            "blueprintTech"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!stack) {
        return;
    }

    const technologies = [

        ...(stack.frontend || []),

        ...(stack.backend || []),

        ...(stack.database || []),

        ...(stack.ai || [])
    ];

    if (!technologies.length) {

        container.innerHTML =
            "<span>No technology information available.</span>";

        return;
    }

    technologies.forEach(
        (technology) => {

            const tag =
                document.createElement(
                    "span"
                );

            tag.className =
                "blueprint-tag";

            tag.textContent =
                technology;

            container.appendChild(
                tag
            );
        }
    );
}


/* =========================================================
   LOCAL PROJECT STORAGE
   ========================================================= */

function getSavedProjects() {

    const saved =
        localStorage.getItem(
            PROJECTS_STORAGE_KEY
        );

    if (!saved) {
        return [];
    }

    try {

        const projects =
            JSON.parse(saved);

        return Array.isArray(projects)
            ? projects
            : [];

    } catch (error) {

        console.error(
            "Project storage error:",
            error
        );

        return [];
    }
}


function saveAllProjects(projects) {

    localStorage.setItem(
        PROJECTS_STORAGE_KEY,
        JSON.stringify(projects)
    );
}


function saveProject(project) {

    if (!project) {
        return;
    }

    const projects =
        getSavedProjects();

    const existingIndex =
        projects.findIndex(
            (item) =>
                item.id === project.id
        );

    if (existingIndex >= 0) {

        projects[existingIndex] =
            project;

    } else {

        projects.push(
            project
        );
    }

    saveAllProjects(
        projects
    );
}


function getUserProjects() {

    const user =
        getCurrentUser();

    if (!user) {
        return [];
    }

    const userId =
        user.id ||
        user._id;

    return getSavedProjects().filter(
        (project) =>
            project.owner === userId
    );
}


/* =========================================================
   SAVE CURRENT PROJECT - MONGODB
   ========================================================= */

async function saveCurrentProject() {

    if (
        !currentProject ||
        !currentBlueprint
    ) {

        showToast(
            "Generate a blueprint first.",
            "error"
        );

        return;
    }

    /*
       If the user clicks Save Project
       while still editing, capture changes first.
    */

    if (blueprintEditMode) {
        captureEditableBlueprint();
    }

    const user =
        getCurrentUser();

    if (!user) {

        showToast(
            "Please login first.",
            "error"
        );

        openLogin();

        return;
    }

    const userId =
        user.id ||
        user._id;

    if (!userId) {

        showToast(
            "User ID not found. Please login again.",
            "error"
        );

        return;
    }

    currentProject.blueprint =
        currentBlueprint;

    currentProject.title =
        currentBlueprint.title;

    currentProject.updatedAt =
        new Date().toISOString();

    try {

        console.log(
            "Saving project to MongoDB..."
        );

        const response =
            await fetch(
                `${API_BASE_URL}/projects/save`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            userId,

                        title:
                            currentBlueprint.title,

                        idea:
                            currentProject.idea,

                        blueprint:
                            currentBlueprint
                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "MongoDB Project Response:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save project."
            );
        }

        /* LocalStorage backup */

        saveProject(
            currentProject
        );

        renderSavedProjects();

        showToast(
            "Project saved successfully! 🎉",
            "success"
        );

    } catch (error) {

        console.error(
            "MongoDB Save Project Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to save project.",
            "error"
        );
    }
}


/* =========================================================
   RENDER SAVED PROJECTS
   ========================================================= */

function renderSavedProjects() {

    const container =
        document.getElementById(
            "projectsContainer"
        );

    if (!container) {
        return;
    }

    const projects =
        getUserProjects();

    const projectCount =
        document.getElementById(
            "projectCount"
        );

    if (projectCount) {

        projectCount.textContent =
            projects.length;
    }

    if (!projects.length) {

        container.innerHTML = `

            <div class="empty-projects">

                <div class="empty-projects-icon">
                    ✦
                </div>

                <h3>
                    No projects yet
                </h3>

                <p>
                    Create your first AI-powered
                    project blueprint.
                </p>

                <button
                    type="button"
                    class="primary-btn"
                    onclick="openBuilder()"
                >
                    Create your first project
                </button>

            </div>
        `;

        return;
    }

    container.innerHTML = "";

    projects.forEach(
        (project) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "project-card";

            const date =
                project.updatedAt
                    ? new Date(
                        project.updatedAt
                    ).toLocaleDateString()
                    : "";

            card.innerHTML = `

                <div class="project-card-content">

                    <h3>
                        ${escapeHTML(
                            project.title ||
                            "Untitled Project"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            project.idea ||
                            ""
                        )}
                    </p>

                    <small>
                        Updated ${escapeHTML(date)}
                    </small>

                </div>

                <div class="project-card-actions">

                    <button
                        type="button"
                        onclick="openSavedProject('${project.id}')"
                    >
                        Open
                    </button>

                    <button
                        type="button"
                        onclick="deleteProject('${project.id}')"
                    >
                        Delete
                    </button>

                </div>

            `;

            container.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   OPEN SAVED PROJECT
   ========================================================= */

function openSavedProject(projectId) {

    const projects =
        getUserProjects();

    const project =
        projects.find(
            (item) =>
                item.id === projectId
        );

    if (!project) {

        showToast(
            "Project not found.",
            "error"
        );

        return;
    }

    blueprintEditMode = false;

    currentProject =
        project;

    currentBlueprint =
        normalizeBlueprint(
            project.blueprint || {}
        );

    renderBlueprint(
        currentBlueprint
    );

    renderSuggestions(
        currentBlueprint
    );

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    const blueprint =
        document.getElementById(
            "blueprintSection"
        );

    const builder =
        document.getElementById(
            "builder"
        );

    const visual =
        document.getElementById(
            "visualSection"
        );

    if (dashboard) {
        dashboard.style.display = "none";
    }

    if (builder) {
        builder.style.display = "none";
    }

    if (visual) {
        visual.style.display = "none";
    }

    if (blueprint) {
        blueprint.style.display = "block";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   DELETE PROJECT
   ========================================================= */

function deleteProject(projectId) {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }

    const userId =
        user.id ||
        user._id;

    const projects =
        getSavedProjects();

    const updatedProjects =
        projects.filter(
            (project) =>
                !(
                    project.id === projectId &&
                    project.owner === userId
                )
        );

    saveAllProjects(
        updatedProjects
    );

    renderSavedProjects();

    showToast(
        "Project deleted.",
        "success"
    );
}


/* =========================================================
   VISUAL GENERATOR
   ========================================================= */

function openVisualGenerator() {

    if (!currentBlueprint) {

        showToast(
            "Generate a blueprint first.",
            "error"
        );

        return;
    }

    if (blueprintEditMode) {
        captureEditableBlueprint();
    }

    const blueprint =
        document.getElementById(
            "blueprintSection"
        );

    const visual =
        document.getElementById(
            "visualSection"
        );

    if (blueprint) {
        blueprint.style.display = "none";
    }

    if (visual) {
        visual.style.display = "block";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   SET ACTIVE VISUAL OPTION
   ========================================================= */

function setActiveVisualOption(type) {

    currentVisualType =
        type;

    const buttons =
        document.querySelectorAll(
            ".visual-option"
        );

    buttons.forEach(
        (button) => {

            button.classList.remove(
                "active"
            );
        }
    );

    buttons.forEach(
        (button) => {

            const onclick =
                button.getAttribute(
                    "onclick"
                ) || "";

            if (
                onclick.includes(
                    `'${type}'`
                )
            ) {

                button.classList.add(
                    "active"
                );
            }
        }
    );
}


/* =========================================================
   REAL AI VISUAL GENERATION
   ========================================================= */

async function generateProjectVisual(
    type = currentVisualType
) {

    if (!currentBlueprint) {

        showToast(
            "Generate a blueprint first.",
            "error"
        );

        return;
    }

    if (blueprintEditMode) {
        captureEditableBlueprint();
    }

    currentVisualType =
        type;

    const preview =
        document.getElementById(
            "visualPreview"
        );

    if (!preview) {
        return;
    }

    preview.innerHTML = `

        <div class="visual-placeholder">

            <div class="visual-icon">
                ✦
            </div>

            <h3>
                Generating ${escapeHTML(
                    capitalize(type)
                )}...
            </h3>

            <p>
                AI is creating a visual based on your blueprint.
            </p>

        </div>
    `;

    try {

        const features =
            (currentBlueprint.coreFeatures || [])
                .map(
                    (feature) =>
                        typeof feature === "string"
                            ? feature
                            : feature.name
                );

        const modules =
            currentBlueprint.modules || [];

        const techStack = [

            ...(currentBlueprint.techStack?.frontend || []),

            ...(currentBlueprint.techStack?.backend || []),

            ...(currentBlueprint.techStack?.database || []),

            ...(currentBlueprint.techStack?.ai || [])
        ];

        const response =
            await fetch(
                `${API_BASE_URL}/ai/generate-visual`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        title:
                            currentBlueprint.title,

                        description:
                            currentBlueprint.description,

                        features:
                            features,

                        modules:
                            modules,

                        techStack:
                            techStack,

                        visualType:
                            type
                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "AI Visual Response:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to generate AI visual."
            );
        }

        if (!data.image) {

            throw new Error(
                "AI did not return an image."
            );
        }

        preview.innerHTML = `

            <div class="generated-ai-image">

                <img
                    src="${escapeHTML(
                        data.image
                    )}"
                    alt="${escapeHTML(
                        currentBlueprint.title
                    )} AI generated ${escapeHTML(
                        type
                    )} visual"
                />

            </div>

        `;

        showToast(
            `${capitalize(type)} AI visual generated!`,
            "success"
        );

    } catch (error) {

        console.error(
            "AI Visual Generation Error:",
            error
        );

        preview.innerHTML = `

            <div class="visual-placeholder">

                <div class="visual-icon">
                    !
                </div>

                <h3>
                    Visual generation failed
                </h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Unable to generate AI visual."
                    )}
                </p>

            </div>
        `;

        showToast(
            error.message ||
            "Unable to generate AI visual.",
            "error"
        );
    }
}


/* =========================================================
   VISUAL BUTTON COMPATIBILITY
   ========================================================= */

function generateVisual(type) {

    generateProjectVisual(
        type
    );
}


/* =========================================================
   ARCHITECTURE VISUAL - FALLBACK
   ========================================================= */

function createArchitectureVisual() {

    if (!currentBlueprint) {
        return "";
    }

    const modules =
        currentBlueprint.modules || [];

    const stack =
        currentBlueprint.techStack || {};

    const frontend =
        (stack.frontend || []).join(" • ") ||
        "Frontend";

    const backend =
        (stack.backend || []).join(" • ") ||
        "Backend API";

    const database =
        (stack.database || []).join(" • ") ||
        "Database";

    const ai =
        (stack.ai || []).join(" • ") ||
        "AI Engine";

    return `

        <div class="generated-visual">

            <h3>
                System Architecture
            </h3>

            <div class="architecture-flow">

                <div class="architecture-node">
                    User / Client
                </div>

                <div class="architecture-arrow">
                    ↓
                </div>

                <div class="architecture-node">

                    Frontend

                    <small>
                        ${escapeHTML(frontend)}
                    </small>

                </div>

                <div class="architecture-arrow">
                    ↓
                </div>

                <div class="architecture-node">

                    Backend API

                    <small>
                        ${escapeHTML(backend)}
                    </small>

                </div>

                <div class="architecture-arrow">
                    ↓
                </div>

                <div class="architecture-grid">

                    ${modules.map(
                        (module) => `

                            <div class="architecture-node">

                                ${escapeHTML(
                                    module
                                )}

                            </div>
                        `
                    ).join("")}

                </div>

                <div class="architecture-arrow">
                    ↓
                </div>

                <div class="architecture-node">

                    ${escapeHTML(database)}

                </div>

                <div class="architecture-arrow">
                    ↕
                </div>

                <div class="architecture-node">

                    ${escapeHTML(ai)}

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   WORKFLOW VISUAL - FALLBACK
   ========================================================= */

function createWorkflowVisual() {

    if (!currentBlueprint) {
        return "";
    }

    const workflow =
        currentBlueprint.workflow || [];

    return `

        <div class="generated-visual">

            <h3>
                Project Workflow
            </h3>

            <div class="visual-workflow">

                ${workflow.map(
                    (step, index) => `

                        <div class="visual-workflow-step">

                            <div class="visual-step-number">
                                ${index + 1}
                            </div>

                            <div>
                                ${escapeHTML(step)}
                            </div>

                        </div>

                        ${
                            index <
                            workflow.length - 1
                                ? `
                                    <div class="visual-workflow-arrow">
                                        ↓
                                    </div>
                                `
                                : ""
                        }

                    `
                ).join("")}

            </div>

        </div>
    `;
}


/* =========================================================
   UI VISUAL - FALLBACK
   ========================================================= */

function createUIVisual() {

    if (!currentBlueprint) {
        return "";
    }

    const title =
        currentBlueprint.title ||
        "AI Project Builder";

    const features =
        currentBlueprint.coreFeatures || [];

    return `

        <div class="generated-visual">

            <h3>
                UI Concept
            </h3>

            <div class="mock-browser">

                <div class="mock-browser-bar">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>

                <div class="mock-ui">

                    <div class="mock-sidebar">

                        <strong>
                            ✦ AI
                        </strong>

                        <div></div>
                        <div></div>
                        <div></div>

                    </div>

                    <div class="mock-main">

                        <h3>
                            ${escapeHTML(title)}
                        </h3>

                        <div class="mock-stat-grid">

                            <div></div>
                            <div></div>
                            <div></div>

                        </div>

                        <div class="mock-content-grid">

                            <div class="mock-large-card">

                                <strong>
                                    Core Features
                                </strong>

                                ${features
                                    .slice(0, 4)
                                    .map(
                                        (feature) => {

                                            const name =
                                                typeof feature === "string"
                                                    ? feature
                                                    : feature.name || "";

                                            return `

                                                <p>
                                                    • ${escapeHTML(
                                                        name
                                                    )}
                                                </p>
                                            `;
                                        }
                                    )
                                    .join("")}

                            </div>

                            <div class="mock-large-card">

                                <strong>
                                    AI Insights
                                </strong>

                                <div class="mock-chart">

                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) {

        console.log(message);

        return;
    }

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    if (toastMessage) {

        toastMessage.textContent =
            message;

    } else {

        toast.textContent =
            message;
    }

    toast.className =
        `toast ${type}`;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        window.toastTimeout
    );

    window.toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function scrollToFeatures() {

    const section =
        document.getElementById(
            "features"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


function scrollToHowItWorks() {

    const section =
        document.getElementById(
            "how"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


/* =========================================================
   KEYBOARD EVENTS
   ========================================================= */

function setupKeyboardEvents() {

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeLogin();
            }
        }
    );
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   CAPITALIZE
   ========================================================= */

function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}