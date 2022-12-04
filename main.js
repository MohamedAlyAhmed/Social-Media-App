axios.get("https://tarmeezacademy.com/api/v1/posts").then((res) => {
  const postTitle = "";

  res.data.data.map((post, index) => {
    post.title === null ? postTitle : (postTitle = post.title);
    console.log(post);
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
                    <span class="text-warning id="post-tags-${post.id}"></span>
                </div>
                </div>
            </div>
        `;

    document.querySelector("#posts-content").innerHTML += postPreview;

    // document.getElementById(`post-tags-${post.id}`).innerHTML = "";

    // post.tags.map((e)=>{
    //     console.log(e.name);
    //     console.log(post.id);
    //     let postID = `post-tags-${post.id}`;
    //     let tagsPreview = `
    //     <button class="btn btn-success rounded-pill py-0 px-1 mx-1"> ${e.name}</button>

    //      `
    //     document.getElementById(postID).innerHTML += tagsPreview;
    // })
  });
});
