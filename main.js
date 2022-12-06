const BASE_URL = "https://tarmeezacademy.com/api/v1";

//GET POSTS
axios.get(`${BASE_URL}/posts?limit=5`).then((res) => {
  let postTitle = "";
  console.log(res.data.data);
  res.data.data.map((post) => {
    post.title === null ? (postTitle = "") : (postTitle = post.title);
    let postPreview = `
                <div class="card glassy shadow my-4" style="border: none">
                <div class="card-header text-white">
                <img src="./images/profile.png" alt="userpic" width="30" />
                <span class="ms-2">${post.author.name}</span>
                </div>
                <div class="card-body">
                <img src='./images/postbg.jpg' alt="" style="max-width: 100%"/>
                <p class="card-title mt-1 text-white-50">${post.created_at}</p>
                <h5 class="card-title mt-2 text-white">
                    ${postTitle}
                </h5>
                <p class="card-text text-white-50">
                ${post.body}
                </p>
                <hr class="text-light" />
                <div>
                    <span class="text-light"> (${post.comments_count}) Comments </span>
                    <span id="post-tags-${post.id}"></span>
                </div>
                </div>
            </div>
        `;

    document.querySelector("#posts-content").innerHTML += postPreview;

    //ITERATE FOR TAGES
    post.tags.map((tag) => {
      document.getElementById(
        `post-tags-${post.id}`
      ).innerHTML += `<button class="btn btn-success rounded-pill py-0 px-2 mx-1"> #${tag.name}</button>`;
    });
  });
});

//LOGIN USER
function LoginBtn() {
  const userName = document.querySelector("#username-input").value;
  const password = document.querySelector("#password-input").value;

  axios
    .post(`${BASE_URL}/login`, {
      username: userName,
      password: password,
    })
    .then((res) => {
      localStorage.setItem("user-token", res.data.token);
      localStorage.setItem("user-data", JSON.stringify(res.data.user));
      RerenderUI();
      showSuccessAlert();
      bootstrap.Modal.getInstance(
        document.querySelector("#login-modal")
      ).hide();
    });
}

//RERENDER UI
function RerenderUI() {
  const token = localStorage.getItem("user-token");
  const loginBtn = document.querySelector("#login-btn");
  const registerBtn = document.querySelector("#register-btn");
  const logoutBtn = document.querySelector("#logout-btn");

  if (token === null) {
    console.log("NO USER Logged in");
    loginBtn.style.display = "flex";
    registerBtn.style.display = "flex";
    logoutBtn.style.display = "none";
  } else {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "flex";
  }
}

//LOGOUT USER
function logoutUser() {
  localStorage.removeItem("user-token");
  localStorage.removeItem("user-data");
  RerenderUI();
  showSuccessAlert();
}

//ALERT SUCCESS
function showSuccessAlert() {
  const alertPlaceholder = document.getElementById("success-alert");

  const alert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");
    alertPlaceholder.append(wrapper);
  };

  alert("Nice, you Success !", "success");

  setTimeout(() => {
    const alertHide = bootstrap.Alert.getOrCreateInstance("#success-alert");
    alertHide.close();
  }, 3000);
}
