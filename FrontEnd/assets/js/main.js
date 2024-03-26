let allWorks = [];
let sign = document.getElementById('sign');
localStorage.setItem('filter', 'all');







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

const getWorks = async () => {
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
};

getWorks();


const resetImage = () => {
 
  
    document.getElementsByClassName('box-image')[0].style.display = "flex";
    document.getElementById('preview').style.display = "none";


}

const setupPages = (works) => {
    const worksContainer = document.querySelector(".gallery");
    worksContainer.innerHTML = "";
    if (works.length === 0) {
        worksContainer.innerHTML = "Aucun projet de cette catégorie n'est publié";
        return;
    }
    works.forEach((work) => {
        const workElement = document.createElement("figure");
        workElement.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        worksContainer.appendChild(workElement); // Ajouter l'élément de travail à la galerie
    });
};
const filterWorks = (category, id) => {
    const works = category === 0 ? allWorks : allWorks.filter((work) => work.categoryId === category);
    let storageFlt = localStorage.getItem('filter'); 
    document.getElementById(storageFlt).classList.remove('flt-active');
    document.getElementById(id).classList.add('flt-active');
    localStorage.setItem('filter', id);
    setupPages(works);
};

const fileInput = document.getElementById('file');
const previewImage = document.getElementById('preview-image');

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const error = document.getElementById('return_add');
    if (file.size > 4 * 1024 * 1024) { 
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
    fetch("http://localhost:5678/api/categories").then(async (response) => {
      const categories = await response.json();
      let select = document.getElementById('categorie');
  
      categories.forEach((category) => {
        let option = document.createElement('option');
        option.value = category.id;
        option.text = category.name;
        select.appendChild(option);
      });
  

    }).catch((error) => {
      alert("Une erreur est survenue lors de la récupération des catégories");
    });

    const allInputs = document.querySelectorAll('input[required], select[required]');
    const btn = document.getElementById('btn-add');

    function checkInputs() {
      let allFilled = true;
      for (const input of allInputs) {
        if (!input.value) {
          allFilled = false;
          break;
        }
      }
      btn.disabled = !allFilled;
    }
    for (const input of allInputs) {
      input.addEventListener('change', checkInputs);
    }

    btn.addEventListener('click', async function(event) {
      event.preventDefault();

    const title = document.getElementById('title').value;
    const categoryId = document.getElementById('categorie').value;
    const file = document.getElementById('file').files[0];
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', file);
    formData.append('category', categoryId);
    const token = localStorage.getItem('token');
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
   

    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    }).then( async (response) => {
        console.log
        let p_message = document.getElementById('return_delete');
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