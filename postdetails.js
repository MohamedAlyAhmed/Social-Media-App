//GLOBAL VARIABLES
const BASE_URL = "https://tarmeezacademy.com/api/v1";
//Get Post ID Params
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("postId");
const token = localStorage.getItem("user-token");

RerenderUI();
getPostDetails();

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
    userProfileImage.style.display = "none";
  } else {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    userProfileData.style.display = "flex";
    logoutBtn.style.display = "flex";
    userProfileImage.style.display = "block";
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

//Get Post Details By ID
function getPostDetails() {
  //Get Post by ID
  axios
    .get(`${BASE_URL}/posts/${postId}`)
    .then((res) => {
      let post = res.data.data;
      let postTitle = "";
      let postImage = "./images/postbg.jpg";
      let userImage = "./images/profile.png";

      post.title === null ? (postTitle = "") : (postTitle = post.title);
      typeof post.image === typeof {}
        ? (postImage = "./images/postbg.jpg")
        : (postImage = post.image);
      typeof post.author.profile_image === typeof {}
        ? (userImage = "./images/profile.png")
        : (userImage = post.author.profile_image);
      let postPreview = `
                  <h2 class="text-light mt-5 "> ${post.author.name}'s Post</h2>
                  <div class="card glassy shadow my-4" style="border: none; cursor: default;">
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
                  <div id="comments">


                 </div>
                 
                 <div class="input-group mb-3 mt-3">
                     <input id="comment-input" type="text" class="form-control" placeholder="Write Your Comment ..." aria-label="Write Your Comment ..." aria-describedby="button-addon2">
                    <button class="btn btn-outline-secondary" type="button" id="button-addon2" onclick="addComment()">Send</button>
                </div>
                  </div>
              </div>
              <span id="spinner"></span>
          `;

      document.querySelector("#post-content").innerHTML = postPreview;

      //ITERATE FOR TAGES
      post.tags.map((tag) => {
        document.getElementById(
          `post-tags-${post.id}`
        ).innerHTML += `<button class="btn btn-success rounded-pill py-0 px-2 mx-1"> #${tag.name}</button>`;
      });

      //ITERATE FOR COMMENTS
      post.comments.map((comment) => {
        //Handle image failed
        let userImageHandle = "./images/profile.png";
        typeof comment.author.profile_image === typeof {}
          ? (userImageHandle = "./images/profile.png")
          : (userImageHandle = comment.author.profile_image);

        document.getElementById("comments").innerHTML += `
             
             <hr class="text-light" />
             <div class="p-2 rounded mb-3 d-flex flex-row" style="background-color: #57607bcf;">
            <div class="me-3">
                <img src=${userImageHandle} class="rounded-circle" style="width: 3rem;height:3rem; object-fit:fill;">
                </div>
                <div class="text-white">
                <div class="text-dark fw-bold">${comment.author.username}</div>
                ${comment.body}
                 </div>
             </div>
             
             `;
      });
    })
    .catch((error) => {
      if (error !== null) {
        showAlert(error.response.data.message, "danger");
      }
    });
}

//ADD COMMENT
function addComment() {
  const commentInput = document.querySelector("#comment-input").value;

  axios
    .post(
      `${BASE_URL}/posts/${postId}/comments`,
      { body: commentInput },
      {
        headers: { authorization: `Bearer ${token}` },
      }
    )
    .then((res) => {
      showAlert("Comment Created Successfully ♥", "success");
      getPostDetails();
    })
    .catch((error) => {
      if (error !== null) {
        showAlert(error.response.data.message, "danger");
      }
    });
}
