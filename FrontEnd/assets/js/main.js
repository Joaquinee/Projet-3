let allWorks = [];
let allCategories = [];
let sign = document.getElementById('sign');
let newCats = false;
init();


async function init() {
   await  getWorks();
    await displayCats();
}
/**
 * @returns {Promise<Array>} works
 */
async function getWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        const works = await response.json();
        allWorks = works;
        setupPages(works);
        return works;
    } catch (error) {
        console.error(`Erreur : ${error}`);
        return [];
    }
}
/**
 * @returns {Promise<Array>} categories
 */
async function displayCats() {
    await fetch("http://localhost:5678/api/categories").then( async (response) => {
            const categories = await response.json();
            categories.forEach((category) => {
                allCategories.push(category);
                let btn = document.createElement('button');
                btn.dataset.category = category.id;
                btn.classList.add('flt-btn');
                btn.addEventListener('click', function() {
                    filterWorks(category.id);
                })
                let title = document.createElement('span');
                title.classList.add('flt-btn-text');
                title.innerHTML = category.name;
                btn.appendChild(title);
                document.querySelector(".flt-box").appendChild(btn)
            });
    }).catch((error) => {
        alert(error);
    });
}
sign.addEventListener('click', async function(event) {
    event.preventDefault();
    if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        alert("Vous êtes déconnecté")
        window.location.href = 'http://127.0.0.1:5501/';
    } else {
        window.location.href = 'http://127.0.0.1:5501/login.html';

    }
});

document.getElementById('preview').addEventListener('click', function() {
    document.getElementsByClassName('box-image')[0].style.display = "flex";
    document.getElementById('preview').style.display = "none";
})


const setupPages = (works) => {
    const worksContainer = document.querySelector(".gallery");
    worksContainer.innerHTML = "";
    if (works.length === 0) {
        worksContainer.innerHTML = "Aucun projet de cette catégorie n'est publié";
        return;
    }
    works.forEach((work) => {
        const workElement = document.createElement("figure");
        workElement.setAttribute('data-category', work.categoryId);
        workElement.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        worksContainer.appendChild(workElement);
    });
};
const filterWorks = (id) => {
    const allBtn = document.querySelectorAll('.flt-btn');
    allBtn.forEach((btn) => {
        btn.addEventListener('click', function(e) {
            const category = this.getAttribute('data-category');
            allBtn.forEach((otherBtn) => {
                if (otherBtn !== this) {
                    otherBtn.classList.remove('flt-active');
                }
            });
            this.classList.add('flt-active');
            document.querySelectorAll('.gallery figure').forEach((work) => {
                if (category === null || category === '') {
                    work.style.display = 'block';
                } else if (work.getAttribute('data-category') === category) {
                    work.style.display = 'block';
                } else {
                    work.style.display = 'none';
                }
            });
        });
    });
};
document.getElementById('file').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const error = document.getElementById('return_add');
    if (file.size > 4 * 1024 * 1024) { 
        error.style.cssText = "color: red;";
        error.innerHTML = "L'image doit être inférieure à 4 Mo";
        return;
    }
    document.getElementsByClassName('box-image')[0].style.display = "none";
    document.getElementById('preview').style.display = "flex";
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('img-preview').src = e.target.result; 
    };
    reader.readAsDataURL(file);
});
const setupModalEdit = async () => {
    let select = document.getElementById('categorie');
    select.innerHTML = "";

    select.addEventListener('change', function(e) {
        if (e.target.value == "new") {
            newCats = true;
            let newCat = document.createElement('input');
            newCat.type = "text";
            newCat.placeholder = "Nouvelle catégorie";
            newCat.id = "new-cat";
            newCat.name = "new-cat";
            newCat.required = true;
            newCat.classList.add('form-input')
            select.parentNode.appendChild(newCat);
            select.disabled = true;
        } else {
            newCats = false;
            document.getElementById('new-cat').remove();
            select.disabled = false;
        }
            
    });
    allCategories.forEach(category => {
        let option = document.createElement('option');
        option.value = category.id;
        option.text = category.name;
        select.appendChild(option);
    }); 

    let newCats = document.createElement('option');
    newCats.text = "Nouveau ..";
    newCats.value = "new";
    select.appendChild(newCats);

    const btn = document.getElementById('btn-add');
    checkChangeInput();
    function checkInputs() {

        let allInputs;
        if (newCats) {
            allInputs = document.querySelectorAll('form#form-create input');
        } else {
            allInputs = document.querySelectorAll('form#form-create input, form#form-create select');
        }
        let allFilled = true;
        for (const input of allInputs) {
            if (!input.value.trim()) {
            allFilled = false;
            break;
            }
        }
        btn.disabled = !allFilled;
        return allFilled;
    }
    function checkChangeInput() {
        let allInputs;
        if (newCats) {
            allInputs = document.querySelectorAll('form#form-create input');
        } else {
            allInputs = document.querySelectorAll('form#form-create input, form#form-create select');
        }

        for (const input of allInputs) {
            input.addEventListener('change', checkInputs);
        }
    }
    btn.addEventListener('click', async function(event) {
      event.preventDefault();
        if (!checkInputs()) {
            return;
        }
        const title = document.getElementById('title').value;
        const file = document.getElementById('file').files[0];
        let categoryId = document.getElementById('categorie').value;
        const token = localStorage.getItem('token');

        if (newCats) {
            let name = document.getElementById('new-cat').value;
            
            
            const cat = new FormData();
            cat.append('name', name);
           
            await fetch("http://localhost:5678/api/categories", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: cat
            }).then(async (response) => {

                let res = await response.json();
                categoryId = res.id;
            }).catch((error) => {
                console.error('Erreur :', error);
                return;
            });
        
            
        };  
       
        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', file);
        formData.append('category', categoryId);
        
        const req = await fetch("http://localhost:5678/api/works", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: formData,
    }).then(async (response) => {
        let succes = document.getElementById('return_add');
        succes.style.cssText = "color: green;";
        succes.innerHTML = "Le projet a été ajouté avec succès";
        newCats = false;
        document.getElementById('new-cat').remove();
        select.disabled = false;
        document.getElementById('form-create').reset();
        document.getElementsByClassName('box-image')[0].style.display = "flex";
        document.getElementById('preview').style.display = "none";
        document.getElementById('btn-add').disabled = true;
        const res = await response.json();
            allWorks.push({
                id: res.id,
                title: title,
                imageUrl: res.imageUrl,
                categoryId: categoryId
                });
            setupPages(allWorks);
            });
        });
};
const setupModal = async () => {
    const editContainer = document.getElementById("container-edit");
    editContainer.innerHTML = "";
    if (allWorks.length === 0) {
        editContainer.innerHTML = "Aucune photo n'est publié";
        return;
    }
    allWorks.forEach((work) => {
        const element = document.createElement("div");
        element.classList.add("box-edt");
        element.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <span class="delete-icon">
                <img src="./assets/icons/delete.png" alt="delete" onclick="deleteWork(${work.id})">
            </span>
        `;
        editContainer.appendChild(element); // Ajouter l'élément de travail à la galerie
    });
}



const deleteWork = async (id) => {
    const token = localStorage.getItem('token');
    let p_message = document.getElementById('return_delete');
    if (!allWorks.find((work) => work.id === id)) {
        p_message.style.cssText = "color: red;";
        p_message.innerHTML = "Une erreur est survenue lors de la suppression du projet"; 
        return;
    }
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    }).then( async (response) => {
        
        if (response.status == 204) {
            let last = allWorks.filter((work) => work.id !== id);
            allWorks = last;
            setupModal()
            setupPages(allWorks);
            p_message.style.cssText = "color: green;";
            p_message.innerHTML = "Le projet a été supprimé avec succès"; 
        } else {
            p_message.style.cssText = "color: red;";
            p_message.innerHTML = "Une erreur est survenue lors de la suppression du projet"; 
        }
    });
}

//TODO
document.getElementById('edit-close').addEventListener('click',  function() {
    window.edit.close();
});
document.getElementById('all-close').addEventListener('click',  function() {
    window.create.close();
    window.edit.close();
});
document.getElementById('back-edit').addEventListener('click',  function() {
    window.create.close();
    openModal('edit');
});
document.getElementById('open-edit').addEventListener('click',  function() {
    openModal('edit');
})

document.getElementById('open-create').addEventListener('click',  function() {
    openModal('add');
    window.edit.close()
})

const openModal = async (type) => {
    switch (type) {
        case 'add':
            window.create.showModal();
            await setupModalEdit();
            break;
        case 'edit':
            window.edit.showModal();
            await setupModal();
            break;
        default:
            break;
    }
};

if (localStorage.getItem('token')) {
    document.getElementById('sign').innerHTML = "logout";
    document.getElementsByClassName('filtres')[0].style.display = "none";
    let all_edit = document.getElementsByClassName('edit-mode');
    for(var i = 0; i < all_edit.length; i++) {
        all_edit[i].style.display = "block";
    }
    let baseHeaders = document.querySelector('header');
    baseHeaders.style.cssText = "padding-top : 38px !important;";
   
}