const BASE_URL = "https://tarmeezacademy.com/api/v1";
const loading = document.querySelector(".spinner-border");
let currentPage = 1;
let lastPage = 1;

getPosts();
RerenderUI();

//INFINITE SCROLLING (PAGENATION)
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  let endOfPage = scrollTop + clientHeight >= scrollHeight ? true : false;

  if (endOfPage === true && currentPage < lastPage) {
    //Show Loading Effect
    showLoading();
    //increase page number
    currentPage += 1;
    getPosts(currentPage);
  }
});

//SHOW LOADING
function showLoading() {
  loading.classList.add("show");
}
//HIDE LOADING
function hideLoading() {
  loading.classList.remove("show");
}

//GET POSTS
function getPosts(pageNumber = 1) {
  axios
    .get(`${BASE_URL}/posts?limit=5&page=${pageNumber}`)
    .then((res) => {
      lastPage = res.data.meta.last_page;
      let postTitle = "";
      let postImage = "./images/postbg.jpg";
      let userImage = "./images/profile.png";
      res.data.data.map((post) => {
        post.title === null ? (postTitle = "") : (postTitle = post.title);
        typeof post.image === typeof {}
          ? (postImage = "./images/postbg.jpg")
          : (postImage = post.image);
        typeof post.author.profile_image === typeof {}
          ? (userImage = "./images/profile.png")
          : (userImage = post.author.profile_image);
        let postPreview = `
                <div class="card glassy shadow my-4" style="border: none">
                <div class="card-header text-white">
                <img src=${userImage} alt="userpic"  class="rounded-circle" style="width: 2.5rem;height:2.5rem; object-fit:fill;"/>
                <span class="ms-2">${post.author.name}</span>
                </div>
                <div class="card-body">
                <img src=${postImage} alt="" style="width: 100%; object-fit:fill;"/>
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
            <span id="spinner"></span>
        `;

        document.querySelector("#posts-content").innerHTML += postPreview;

        //ITERATE FOR TAGES
        post.tags.map((tag) => {
          document.getElementById(
            `post-tags-${post.id}`
          ).innerHTML += `<button class="btn btn-success rounded-pill py-0 px-2 mx-1"> #${tag.name}</button>`;
        });
      });
      hideLoading();
    })
    .catch((error) => {
      if (error !== null) {
        showAlert(error.response.data.message, "danger");
      }
    });
}
//RERENDER UI
function RerenderUI() {
  const token = localStorage.getItem("user-token");
  const loginBtn = document.querySelector("#login-btn");
  const registerBtn = document.querySelector("#register-btn");
  const logoutBtn = document.querySelector("#logout-btn");
  const userProfileData = document.querySelector("#user-profile-data");
  const userProfileImage = document.querySelector("#user-profile-image");
  const addPostBtn = document.querySelector("#add-post");
  let profileImage = "./images/profile.png";

  if (token === null) {
    loginBtn.style.display = "flex";
    registerBtn.style.display = "flex";
    logoutBtn.style.display = "none";
    userProfileData.style.display = "none";
    addPostBtn.style.display = "none";
    userProfileImage.style.display = "none";
  } else {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    userProfileData.style.display = "flex";
    logoutBtn.style.display = "flex";
    userProfileImage.style.display = "block";
    addPostBtn.style.display = "block";
    const userData = JSON.parse(localStorage.getItem("user-data"));
    document.querySelector(
      "#user-profile-data"
    ).innerHTML = `<div>${userData.name}</div>`;

    typeof userData.profile_image === typeof {}
      ? (profileImage = "./images/profile.png")
      : (profileImage = userData.profile_image);
    document.querySelector(
      "#user-profile-image"
    ).innerHTML = `<img src=${profileImage} alt="profile-image" class="rounded-circle" style="width:2rem;">`;
  }
}

//LOGIN USER
function LoginUser() {
  const userName = document.querySelector("#username-login").value;
  const password = document.querySelector("#password-login").value;

  axios
    .post(`${BASE_URL}/login`, {
      username: userName,
      password: password,
    })
    .then((res) => {
      localStorage.setItem("user-token", res.data.token);
      localStorage.setItem("user-data", JSON.stringify(res.data.user));
      showAlert("User logged in Successfully ♥", "success");
      bootstrap.Modal.getInstance(
        document.querySelector("#login-modal")
      ).hide();
      RerenderUI();
    })
    .catch((error) => {
      if (error !== null) {
        showAlert(error.response.data.message, "danger");
      }
    });
}

//LOGOUT USER
function logoutUser() {
  localStorage.removeItem("user-token");
  localStorage.removeItem("user-data");
  showAlert("User logged out Successfully ♥", "success");
  RerenderUI();
}

//REGISTER USER
function registerUser() {
  const userName = document.querySelector("#username-register").value;
  const password = document.querySelector("#password-register").value;
  const name = document.querySelector("#name-register").value;
  const image = document.querySelector("#image-register").files[0];

  const formData = new FormData();
  formData.append("username", userName);
  formData.append("password", password);
  formData.append("name", name);
  formData.append("image", image);

  axios
    .post(`${BASE_URL}/register`, formData)
    .then((res) => {
      localStorage.setItem("user-token", res.data.token);
      localStorage.setItem("user-data", JSON.stringify(res.data.user));
      showAlert("User Registered Successfully ♥", "success");
      bootstrap.Modal.getInstance(
        document.querySelector("#register-modal")
      ).hide();
      RerenderUI();
    })
    .catch((error) => {
      if (error !== null) {
        showAlert(error.response.data.message, "danger");
      }
    });
}

//ADD POST
function addPost() {
  const postTitle = document.querySelector("#post-title").value;
  const postBody = document.querySelector("#post-body").value;
  const postImage = document.querySelector("#post-image").files[0];
  const token = localStorage.getItem("user-token");

  let formData = new FormData();
  formData.append("title", postTitle);
  formData.append("body", postBody);
  formData.append("image", postImage);

  axios
    .post(`${BASE_URL}/posts`, formData, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => {
      bootstrap.Modal.getInstance(
        document.querySelector("#add-post-modal")
      ).hide();
      showAlert("Post Created Successfully ♥", "success");
      getPosts();
      RerenderUI();
    })
    .catch((error) => {
      if (error !== null) {
        showAlert(error.response.data.message, "danger");
      }
    });
}

//ALERT
function showAlert(customMessage, alertType) {
  const toastContainer = document.querySelector(".toast-container");

  toastContainer.innerHTML = `
<div id="liveToast" class="toast  text-white" role="alert" aria-live="assertive" aria-atomic="true">
<div class="toast-header ">

  <strong class="me-auto text-${alertType}">Notification</strong>
  <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
</div>
<div class="toast-body bg-${alertType}">
  ${customMessage}
</div>
</div>
`;
  const option = {
    anmation: true,
    delay: 3500,
  };

  const toastLiveExample = document.getElementById("liveToast");
  const toast = new bootstrap.Toast(toastLiveExample, option);
  toast.show();
}
