//GLOBAL VARIABLES
const BASE_URL = "https://tarmeezacademy.com/api/v1";
const loading = document.querySelector(".spinner-border");
const userDataLocal = localStorage.getItem("user-data");

let currentPage = 1;
let lastPage = 1;

getPosts();
RerenderUI();

//INFINITE SCROLLING (PAGENATION)
window.addEventListener("scroll", () => {
  //const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  //let endOfPage = scrollTop + clientHeight >= scrollHeight ? true : false;

  let endOfPage =
    window.innerHeight + window.scrollY >= document.body.scrollHeight
      ? true
      : false;

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
//GET POSTS
function getPosts(pageNumber = 1) {
  console.log("GET POST");
  axios
    .get(`${BASE_URL}/posts?limit=5&page=${pageNumber}`)
    .then((res) => {
      lastPage = res.data.meta.last_page;
      let postTitle = "";
      let postImage = "./images/postbg.jpg";
      let userImage = "./images/profile.png";
      res.data.data.map((post) => {
        //EDIT BTN LOGIC & DELETE BTN LOGIC
        let editBtn = ``;
        let deleteBtn = ``;

        if (userDataLocal !== null && userDataLocal !== undefined) {
          let userId = JSON.parse(localStorage.getItem("user-data")).id;
          let isMyPost = userId != null && post.author.id == userId;

          if (isMyPost) {
            editBtn = `<a onclick="editPost('${encodeURIComponent(
              JSON.stringify(post)
            )}')" 
              data-bs-toggle="modal"
              data-bs-target="#edit-post-modal"
              id="edit-post" style="float: right;"><i class="fa-regular fa-pen-to-square fa-2x"></i></a>`;

            deleteBtn = `
              <a onclick="deletePost(${post.id})" 
              id="delete-post" style="float: right;"><i class="fa-solid fa-trash-can fa-2x ms-4"></i></a>
              `;
          }
        }

        post.title === null ? (postTitle = "") : (postTitle = post.title);
        typeof post.image === typeof {}
          ? (postImage = "./images/postbg.jpg")
          : (postImage = post.image);
        typeof post.author.profile_image === typeof {}
          ? (userImage = "./images/profile.png")
          : (userImage = post.author.profile_image);
        let postPreview = `
                <div class="card glassy shadow my-4" style="border: none" >
                <div class="card-header text-white">
                <span class="profile-user" onclick="getUserProfile(${post.author.id})">
                <img src=${userImage} alt="userpic"  class="rounded-circle" style="width: 2.5rem;height:2.5rem; object-fit:fill;"/>
                <span class="ms-2">${post.author.name}</span>
                </span>
                ${deleteBtn}
                ${editBtn}
                </div>
                <div class="card-body" onclick="postDetails(${post.id})">
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
      if (error !== null && error !== undefined) {
        showAlert(error.response.data.message, "danger");
      }
    });
}
//HIDE LOADING
function hideLoading() {
  loading.classList.remove("show");
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
  const profileNav = document.querySelector("#profile-nav");
  let profileImage = "./images/profile.png";

  if (token === null) {
    loginBtn.style.display = "flex";
    registerBtn.style.display = "flex";
    logoutBtn.style.display = "none";
    userProfileData.style.display = "none";
    addPostBtn.style.display = "none";
    userProfileImage.style.display = "none";
    profileNav.style.display = "none";
  } else {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    userProfileData.style.display = "flex";
    logoutBtn.style.display = "flex";
    userProfileImage.style.display = "block";
    addPostBtn.style.display = "block";
    profileNav.style.display = "block";
    const userData = JSON.parse(localStorage.getItem("user-data"));
    document.querySelector(
      "#user-profile-data"
    ).innerHTML = `<div>${userData.name}</div>`;

    typeof userData.profile_image === typeof {}
      ? (profileImage = "./images/profile.png")
      : (profileImage = userData.profile_image);
    document.querySelector(
      "#user-profile-image"
    ).innerHTML = `<img src=${profileImage} alt="profile-image" class="rounded-circle" style="width: 2.5rem;height:2.5rem; object-fit:fill;">`;
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
      showAlert("User logged in Successfully ???", "success");
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
  showAlert("User logged out Successfully ???", "success");
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
      showAlert("User Registered Successfully ???", "success");
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
      showAlert("Post Created Successfully ???", "success");
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
//POST DETAILS
function postDetails(postId) {
  //alert(postId)
  window.location = `postdetails.html?postId=${postId}`;
}
//EDIT POST MODAL
function editPost(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  document.getElementById("edit-post-title").value = post.title;
  document.getElementById("edit-post-body").value = post.body;
  document.getElementById("edit-post-id").value = post.id;
  document.querySelector("#edit-post-image").files[0] = post.image;
}
//UPDATE POST
function updatePost() {
  const postTitle = document.querySelector("#edit-post-title").value;
  const postBody = document.querySelector("#edit-post-body").value;
  const postImage = document.querySelector("#edit-post-image").files[0];
  const postId = document.getElementById("edit-post-id").value;
  const token = localStorage.getItem("user-token");

  let formData = new FormData();
  formData.append("title", postTitle);
  formData.append("body", postBody);
  formData.append("image", postImage);
  formData.append("_method", "put");

  axios
    .post(`${BASE_URL}/posts/${postId}`, formData, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => {
      bootstrap.Modal.getInstance(
        document.querySelector("#edit-post-modal")
      ).hide();
      showAlert("Post Updated Successfully ???", "success");
      getPosts();
      RerenderUI();
    })
    .catch((error) => {
      if (error !== null) {
        showAlert(error.response.data.message, "danger");
      }
    });
}
//DELETE POST
function deletePost(postId) {
  if (confirm("Are you Sure to Delete Post") == true) {
    const token = localStorage.getItem("user-token");
    axios
      .delete(`${BASE_URL}/posts/${postId}`, {
        headers: { authorization: `Bearer ${token}` },
      })
      .then((res) => {
        showAlert("Post Deleted Successfully ???", "success");
        getPosts();
        RerenderUI();
      })
      .catch((error) => {
        if (error !== null) {
          showAlert(error.response.data.message, "danger");
        }
      });
  }
}
//GET USER PROFILE DATA
function getUserProfile(id) {
  //alert(id)
  window.location = `profile.html?userid=${id}`;
}
