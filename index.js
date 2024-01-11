const searchField = document.getElementById("input_text");
const searchField2 = document.getElementById("input-text");
const list = document.getElementById('search-list');

//function to fetch results from api using the input from searchField 1 & 2
function search(query) {
    //loading circle
    let loader = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`
    list.innerHTML = loader;
    if(query.length === 0){
        list.textContent = ''
        return;
    }

    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
    fetch(url).
    then(response => response.json())
    .then((jsonData) =>{
        const arr = jsonData.meals;
        //remove loading animation3
        list.textContent = ''

        //if no results, show message no result
        if(arr === null){
            
            let item = document.createElement('p');
            item.setAttribute('class', 'no-result')
            if(!list.hasChildNodes()){
                item.innerHTML = '<p style = "font-size: 2.3rem; color:blue;">No results found...</p>';
                
                list.appendChild(item);
            }
            return;
        }
        
        //function to get result from api using arr
        renderResults(arr, false);

    }).catch((error) =>{
        throw(error)
    })
}

function renderResults(results,  isFavListCalled) {
    
    //loop to results array for each meal object and create a meal item 
    for(let result of results){
        
        const item = document.createElement('div');
        item.setAttribute('class', 'meal-container')
        
        const thumbnail= document.createElement('div');
        thumbnail.setAttribute('class', 'card');
        thumbnail.style.backgroundImage = `url(${result.strMealThumb})`

        const name = document.createElement('p');
        name.innerText = result.strMeal;
        name.setAttribute('class', 'card_title')

        const category = document.createElement('p');
        category.innerHTML = `<img src = "./images/category.svg"><span> ${result.strCategory}</span>`;
        category.setAttribute('class', 'category')

        const favouriteBtn = document.createElement('button');
        favouriteBtn.setAttribute('class', 'favourite-btn')
        favouriteBtn.setAttribute('id', result.idMeal)
        favouriteBtn.innerHTML = `֍`
        

        const titleWrapper = document.createElement('div');
        titleWrapper.setAttribute('class', 'title-wrapper')
        titleWrapper.appendChild(name);
        titleWrapper.appendChild(category);

        thumbnail.append(favouriteBtn)

        item.append(thumbnail)
        item.append(titleWrapper)
          
        
        if(isInLocals(result.idMeal) !== -1){
            favouriteBtn.classList.add('is-fav-color')

        }
        
        list.appendChild(item);
        
        //on click event listener if user click on meal name 
         name.addEventListener('click', function loadDetails(){
        //storing meals id in local storage so that it can be get in new tab
            localStorage.setItem(result.idMeal, JSON.stringify(result))
            //pass result id to new window in query string
            window.open('meal_info.html?' + result.idMeal);           
        });



        favouriteBtn.addEventListener('click',  function addToFavourites() {
            //onCLick of favourite button find if item already exists in local storage
            let id = result.idMeal;
            let itemIndex = isInLocals(id);
            let locals;
            //if item already in favourites remove it from local storage
            if( itemIndex !== -1){
                
                locals = JSON.parse(localStorage.getItem('locals'));
                locals.splice(itemIndex, 1);
                this.style.color = 'white'
                //removing color of fav mark
                if(isFavListCalled){
                    this.parentNode.parentNode.style.display = 'none'
                }   
            }
            
            else {
                //if item is not in localStorage create a new object of the meal 
                locals = [];
                let obj = {
                    id: result.idMeal,
                    result
                }
            //if storage is empty, just append the new meal to fav List
               if(localStorage.getItem('locals') === null){
                locals.push(obj);
               }
                //else parse the array stored in localSTorage and push new object to it
               else{
                locals = JSON.parse(localStorage.getItem('locals'));
                locals.push(obj);
               }
                   
                this.style.color = '#e51d5f'                
            }

           //finally store the locals array by jsonStringify method
            if(locals.length !== 0)
            {
                localStorage.setItem('locals', JSON.stringify(locals));
            }
            else{
                //if last item from storage is removed, remove the locals array
                localStorage.removeItem('locals')
            }

              
            }
        );
    }  
    
}

//find if meal already exists in localStorage, returns -1 if not else return index of item
function isInLocals(id){
    let locals = JSON.parse(localStorage.getItem('locals'));
    if(locals == null){
        return -1;
    }
    let itemIndex = locals.findIndex( local => local.id == id );
    return itemIndex;
}


//event listener and function to show favourites on home page
document.getElementById('show-fav').addEventListener('click', showFavourites);

function showFavourites() {
    //clearing the search fields & content
    searchField.value = "";
    searchField2.value = "";
    list.textContent = ''

   let listStringArray =  JSON.parse(localStorage.getItem('locals'));
   if(listStringArray === null){
       return;
   }
   //parse localStorage array then use renderResults function to show the favurite meals
   let listArray = listStringArray.map(meal => {
       return meal.result;
   })
   //boolean isFavListCalled used to check whether to remove the item 
   // if favBtn is clicked inside showFavourites BTN
   renderResults(listArray, true)
}

//clear list when search box is cleared
document.querySelector('input[type = search]').addEventListener('search', (e) => {
    list.textContent = ''
  })





//..............................google type search by using debounce concept, here used 0.5sec delay in key press.................................
let searchTime = 0;
window.onload = () =>{
   
    searchField.onkeyup = (event) =>{

        if(searchField.value.trim().length === 0){
            
            list.textContent = ''
            return;
        }
        //clear previous timeout if keyup is registered before delay, will cancel
        //previous request
        clearTimeout(searchTime);

        //will setup a new request in 500ms/delay time
        searchTime = setTimeout(() => {
            search(searchField.value.trim());
        }, 500);
    }

    searchField2.onkeyup = (event) =>{

        if(searchField2.value.trim().length === 0){
            
            list.textContent = ''
            return;
        }
        //clear previous timeout if keyup is registered before delay
        //previous request
        clearTimeout(searchTime);

        //will setup a new request in 500ms/delay time
        searchTime = setTimeout(() => {
            search(searchField2.value.trim());
        }, 500);
    }
}