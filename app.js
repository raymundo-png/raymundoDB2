// ==============================
// LOGIN
// ==============================

function login() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const message =
        document.getElementById("message");


    // Check empty fields
    if (email === "" || password === "") {

        message.innerHTML =
            "Please enter email and password.";

        message.style.color = "red";

        return;
    }


    // Send login information to server
    fetch("/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email,
            password: password
        })

    })

    .then(response => response.json())

    .then(data => {

        message.innerHTML =
            data.message;


        if (data.success) {

            message.style.color = "green";


            // Save logged-in user
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            // Go to dashboard
            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 1000);

        }

        else {

            message.style.color = "red";

        }

    })

    .catch(error => {

        console.error(error);

        message.innerHTML =
            "Cannot connect to server.";

        message.style.color = "red";

    });

}



// ==============================
// REGISTER
// ==============================

function register() {

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const message =
        document.getElementById("message");


    // Check empty fields
    if (
        name === "" ||
        email === "" ||
        password === ""
    ) {

        message.innerHTML =
            "Please enter name, email and password.";

        message.style.color = "red";

        return;
    }


    // Send registration information to server
    fetch("/register", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })

    })

    .then(response => response.json())

    .then(data => {

        message.innerHTML =
            data.message;


        if (data.success) {

            message.style.color = "green";


            // Clear fields
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";


            // Go to dashboard
            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 1000);

        }

        else {

            message.style.color = "red";

        }

    })

    .catch(error => {

        console.error(error);

        message.innerHTML =
            "Cannot connect to server.";

        message.style.color = "red";

    });

}