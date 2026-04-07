const apikey = "82cd210a";

let searchBoxEle = document.getElementById("searchInput");
let searchBtnEle = document.getElementById("search-btn");
let Display = document.getElementById("display");
searchBtnEle.addEventListener("click", ()=>{
    fetchMovie(searchBoxEle.value)
})


function fetchMovie(query){
    fetch(`http://www.omdbapi.com/?apikey=${apikey}&t=${query}`)
    .then(res => res.json())
    .then(data =>{
        console.log(data)
        let show = document.createElement('div')
        show.innerHTML = `
        <img src=${data.poster}/>
        <p>${data.Title}</p>
        `
        Display.appendChild(show)
    })
}          