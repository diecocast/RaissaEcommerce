const form = document.getElementById('registerForm');

form.addEventListener('submit',evt=>{
    evt.preventDefault();
    let data = new FormData(form);
    let obj = {};
    data.forEach((value,key)=>obj[key]=value);
    fetch('api/sessions/register',{
        method:'POST',
        body:JSON.stringify(obj),
        headers:{
            "Content-Type":"application/json"
        }
    }).then(result=>result.json())
    .then(json=>{
        console.log(json)

        if (json.status == 'error') {
            let errorbox = document.getElementById('errorBox');
            errorbox.innerHTML = json.error;
            document.getElementById('loginForm').reset();
        } 

        if (json.status == 'succes') {
        window.location.href = "/login";
        } 

    })
    form.reset()
})