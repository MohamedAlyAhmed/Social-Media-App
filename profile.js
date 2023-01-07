//GET CURRENT USER
function CurrentUserId() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userid");
  let userData = 1;

  if (userDataLocal !== null) {
    userData = JSON.parse(localStorage.getItem("user-data")).id;
  }

  if (userId !== null && userId !== undefined) {
    return userId;
  } else {
    return userData;
  }
}

//RENDER USER DATA
function getUserData() {
  let id = CurrentUserId();

  axios.get(`${BASE_URL}/users/${id}`).then((res) => {
    let userData = res.data.data;

    const name = document.getElementById("name");
    const userName = document.getElementById("user-name");
    const postsCount = document.querySelector(".user-posts-count");
    const commentsCount = document.querySelector(".user-comments-count");
    const userProfileImage = document.querySelector("#user-profile-img");
    const userNamePosts = document.querySelector("#user-name-posts");

    name.innerHTML = `${userData.name}`;
    userName.innerHTML = `${userData.username}`;
    postsCount.innerHTML = `${userData.posts_count}`;
    commentsCount.innerHTML = `${userData.comments_count}`;
    userProfileImage.setAttribute("src", `${userData.profile_image}`);
    userNamePosts.innerHTML = `${userData.username}'s Posts`;
  });
}
getUserData();

//GET USER POSTS
function getUserPosts() {
  let id = CurrentUserId();
  axios
    .get(`${BASE_URL}/users/${id}/posts`)
    .then((res) => {
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
                  <img src=${userImage} alt="userpic"  class="rounded-circle" style="width: 2.5rem;height:2.5rem; object-fit:fill;"/>
                  <span class="ms-2">${post.author.name}</span>
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

        document.querySelector("#user-posts").innerHTML += postPreview;

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
getUserPosts();
