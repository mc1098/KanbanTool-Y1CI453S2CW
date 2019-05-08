window.addEventListener("load", function (){
    
    var readOnly = true;
    
    
    var loginForm = document.getElementById("login");
    //Simple login form that changes the global readOnly variable to false if login successful.
    document.getElementById("login-submit").onclick = function(e)
    {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200)
            {
                //if true then user and password was correct.
                if(this.responseText == "true")
                {
                    //change global var
                    readOnly = false;
                    //remove read only from title so user can see they are able to change things.
                    document.title = "CI453 Kanban";
                    //remove the login form.
                    document.getElementById("login").style.display = "none";
                    return;
                }
                alert("Incorrect login details!\nTry again.");
            }
        };
        //post as sensitive data
        xhr.open("POST", "php/login.php", true); 
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(`user=${loginForm["user"].value}&pass=${loginForm["pass"].value}`);
    }
    
   
    class Story
    {
        constructor(name, desc, est)
        {
            this.id = -1;
            this.name = name;
            this.desc = desc;
            this.comment = "";
            this.est = est;
            this.status = 0;
        }
        
    }
    
    //Creates the html elements to support the Story class provided.
    function storyElementFactory(story)
    {
        //clone the hidden html element.
        let storyEle = storyTemplate.cloneNode(true);
        //fill element text nodes with story info
        storyEle.getElementsByClassName("story-id")[0].innerHTML = story.id;
        storyEle.getElementsByClassName("story-name")[0].innerHTML = story.name;
        storyEle.getElementsByClassName("story-desc")[0].innerHTML = story.desc;
        let commentContainer = storyEle.getElementsByClassName("story-comment-container")[0];
        commentContainer.innerHTML = story.comment;
        storyEle.getElementsByClassName("story-est")[0].innerHTML = story.est;
        //set story in element dataset.
        storyEle.dataset.story = story;
        
        //add button click functions
        //right button moves the element into the next column to the right.
        storyEle.getElementsByClassName("right")[0].onclick = function (e)
        {
            if(readOnly)
                {
                    alert("Please login to change this Story!")
                    return;
                }
            
            if(story.status === kanbanColumns.length -1) //do nothing if at the end
                return;
            let next = kanbanColumns[story.status +1];
            if(next.childElementCount >= next.dataset.wip)
                {
                    alert(`Next workflow column has reached it's WIP limit\nYou need to clear one of the stories from this column first.`);
                    return;
                }
            kanbanColumns[story.status++].removeChild(storyEle);
            updateStory(story);
            next.appendChild(storyEle);
        }
        //left button moves the element into the next column to the left.
        storyEle.getElementsByClassName("left")[0].onclick = function (e){
            if(readOnly)
                {
                    alert("Please login to change this Story!")
                    return;
                }
            
            if(story.status == 0)
                return; //do nothing if element can't go left
            
            let previous = kanbanColumns[story.status -1];
            if(previous.childElementCount >= previous.dataset.wip)
                {
                    alert(`Previous workflow column has reached it's WIP limit\nYou need to clear one of the stories from this column first.`);
                    return;
                }
            
            kanbanColumns[story.status--].removeChild(storyEle);
            updateStory(story);
            previous.appendChild(storyEle);
            
        }
        //delete button removes the element and deletes the story from the database.
        storyEle.getElementsByClassName("delete-story-btn")[0].onclick = function(e){
            if(readOnly)
                {
                    alert("Please login to change this Story!")
                    return;
                }
            if(confirm(`Are you sure you want to delete story ${story.name}(#${story.id}).`))
                deleteStory(story, storyEle);
        }
        //displays the comment container.
        storyEle.getElementsByClassName("story-comment")[0].onclick = function(e){
            commentContainer.style.display = "block";
            e.stopPropagation();
            if(!readOnly)
                commentContainer.contentEditable = "true";
        }
        
        //add click event listener for commentcontainer.
        window.addEventListener("click", function(e){
            if(e.target != commentContainer)
                {
                    commentContainer.style.display = "none";
                    commentContainer.contentEditable = "false";
                    if(commentContainer.innerHTML !== story.comment)
                    {
                        story.comment = commentContainer.innerHTML;
                        updateStory(story);
                    }
                }
        })
        
        
        return storyEle;
    }
    
    //On load this function will be called to populate the kanbanColumns.
    function storiesToBoard(stories)
    {
        for(let story of stories)
            {
                kanbanColumns[story.status].appendChild(storyElementFactory(story));
                storyId = story.id +1;
            }
    }
    
    //will only be one on load
    var storyTemplate = document.getElementsByClassName("story")[0]; 
    
    var kanbanBoard = document.getElementById("kanban-board");
    var kanbanColumns = document.getElementsByClassName("workflow-column");
    
    
    //story model is for story form input.
    var storyModel = document.getElementById("story-model");
    var storyModelName = document.getElementById("story-name-input");
    var storyModelDesc = document.getElementById("story-desc-input");
    var storyModelEst = document.getElementById("story-est-input");
    
    var storyModelBtn = document.getElementById("add-story-btn");
    var storyModelAccept = document.getElementById("story-model-accept");
    
    //display story form if user has logged in.
    storyModelBtn.onclick = function() 
    {
        if(readOnly)
            alert("Please login to add a new Story.");
        else
            storyModel.style.display = "block";
    }
    //confirm story information provided in form to create new story.
    storyModelAccept.onclick = function() 
    {
        let name = storyModelName.value;
        let desc = storyModelDesc.value;
        let est = storyModelEst.value;   
        
        let story = new Story(name, desc, est);
        saveNewStory(story);
        storyModelName.value = "";
        storyModelDesc.value = "";
        storyModelEst.selectedIndex = -1;
        
    }
    //clicking anywhere other then the storymodel will hide it.
    window.onclick = function(e) 
    {
        if(e.target == storyModel)
            storyModel.style.display = "none";
    }
    //save the provided story to database.
    function saveNewStory(story)
    {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function()
        {
            if(this.readyState == 4 && this.status == 200)
            {
                if(!isNaN(this.responseText))
                    {
                        story.id = this.responseText;
                        let ele = storyElementFactory(story);
                        kanbanColumns[0].appendChild(ele);
                        storyModel.style.display = "none";
                    }
                else
                    storyModel.style.display = "none";
                
            }
        };
        xhttp.open("GET", `php/savenewstory.php?name=${story.name}&desc=${story.desc}&est=${story.est}&status=${story.status}`, true);
        xhttp.send();
    }
    //update the status and comment of the provided story to the database.
    function updateStory(story)
    {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function()
        {
            if(this.readyState == 4 && this.status == 200)
            {
                return (true == this.responseText);
            }
        };
        xhttp.open("GET", `php/updatestory.php?status=${story.status}&comment=${story.comment}&id=${story.id}`, true);
        xhttp.send();
    }
    //delete the story provided from the database, if successful remove the html element 
    //from the kanbanColumns.
    function deleteStory(story, storyEle)
    {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                kanbanColumns[story.status].removeChild(storyEle);
            }
        };
        xhttp.open("GET", `php/deletestory.php?id=${story.id}`, true); 
        xhttp.send();
    }
    
    
    //on load retrieve all stories from database and load html elements.
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() 
    {
        if(this.readyState == 4 && this.status == 200)
        {
            var stories = JSON.parse(this.responseText);
            storiesToBoard(stories.stories);
            console.log(stories);
        }
    };
        
    xhttp.open("GET", "php/getstories.php", true);
    xhttp.send();

    
});