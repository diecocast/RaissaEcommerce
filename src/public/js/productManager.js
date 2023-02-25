const socket = io();
socket.on('list',data=>{
    let log = document.getElementById('lista');
    let list = "";
    console.log(data)
    Array.from(data).forEach(product => {
        if(!product.id) return ''
        list = list+`
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td> <img src="/img/${product.thumbnail}" alt="El enlace no esta disponible" width="60"></td>
            <td><input class="deleteProduct" type="image" src="/img/delete.png" name="pid-${product.id}" value="${product.id}" onclick="deleteProduct('pid-${product.id}')"/></td>
        </tr>`
    });
    log.innerHTML = list;
    document.getElementById("productosForm").reset()
})


let productsForm = document.getElementById('productsForm')
const handleSubmit = (evt,form,route) =>{
    evt.preventDefault()
    let formData = new FormData(form);
    let obj = {};
    formData.forEach((value,key)=>obj[key]=value);
    fetch(route,{
        method:"POST",
        body:formData
    }).then(res =>res.json()).then(json=>console.log(json))
        .then(productsForm.reset());
}

productsForm.addEventListener('submit',(e)=>handleSubmit(e,e.target,'/api/products'))


let deleteForm = document.getElementById('deleteForm')
const deleteSubmit = async(evt,form,route) =>{
    evt.preventDefault()
    let formData = new FormData(form);
    let obj = {};
    formData.forEach((value,key)=>obj[key]=value);
    fetch(route,{
        method:"DELETE",
        body:JSON.stringify(obj),
        headers:{
            "Content-Type":"application/json"
        }
    }).then(res =>res.json())
    .then(json=>{
        console.log(json)
    });

}

deleteForm.addEventListener('submit',(e)=>deleteSubmit(e,e.target,'/api/products'))



function deleteProduct(name) {
    const pid = document.querySelector(`input[name=${name}]`).value;
    const data = { pid };
    fetch('/api/products', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
}