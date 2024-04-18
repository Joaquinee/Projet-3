let allWorks = [];
let allCategories = [];
let sign = document.getElementById('sign');
let newCat = false;
init();



/**
 * Fonction d'initialisation de la page
 */
async function init() {
    await getWorks();
    await displayCats();
}
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
 * Fonction pour afficher les catégories
 */
async function displayCats() {
    await fetch("http://localhost:5678/api/categories").then(async (response) => {
        const categories = await response.json();
        categories.forEach((category) => {
            allCategories.push(category);
            let btn = document.createElement('button');
            btn.dataset.category = category.id;
            btn.classList.add('flt-btn');
            btn.addEventListener('click', () => {
                filterWorks(category.id);
            })
            let title = document.createElement('span');
            title.classList.add('flt-btn-text');
            title.innerText = category.name;
            btn.appendChild(title);
            document.querySelector(".flt-box").appendChild(btn)
        });
    }).catch((error) => {
        alert(error);
    });
}
/**
 * Fonction pour se connecter ou se déconnecter
 */
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

/**
 * Fonction pour afficher l'image
 */
document.getElementById('preview').addEventListener('click', function() {
    document.getElementsByClassName('box-image')[0].style.display = "flex";
    document.getElementById('preview').style.display = "none";
})


/**
 * Function pour chargr les works
 * @param {*} works 
 * @returns 
 */
const setupPages = (works) => {
    const worksContainer = document.querySelector(".gallery");
    worksContainer.innerText = "";
    if (works.length === 0) {
        worksContainer.innerText = "Aucun projet de cette catégorie n'est publié";
        return;
    }
    works.forEach((work) => {
        const workElement = document.createElement("figure");
        workElement.setAttribute('data-category', work.categoryId);
        let setupImg = document.createElement('img');
        setupImg.src = work.imageUrl;
        setupImg.alt = work.title;
        workElement.appendChild(setupImg);

        let setumFig = document.createElement('figcaption');
        setumFig.innerText = work.title;
        workElement.appendChild(setumFig);


        worksContainer.appendChild(workElement);
    });
};

/**
 * Function pour ajouter une catégorie au dom
 * @param {*} category 
 */
const addCat = async (category) => {
    let btn = document.createElement('button');
    btn.dataset.category = category.id;
    btn.classList.add('flt-btn');
    btn.addEventListener('click', () => {
        filterWorks(category.id);
    })
    let title = document.createElement('span');
    title.classList.add('flt-btn-text');
    title.innerText = category.name;
    btn.appendChild(title);
    document.querySelector(".flt-box").appendChild(btn)
}
/**
 * Function pour filtrer les works
 * @param {*} id 
 */
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

/**
 * Function qui gere l'ajout de l'image
 */
document.getElementById('file').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const error = document.getElementById('return_add');
    if (file.size > 4 * 1024 * 1024) {
        error.classList.add('red');
        error.innerText = "L'image doit être inférieure à 4 Mo";
        setTimeout(() => {error.innerText = "";}, 10000);
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

/**
 * Function qui génére le modal pour crée un Work
 */
const setupModalEdit = async () => {
    let select = document.getElementById('categorie');
    select.innerText = "";
    select.addEventListener('change', function(e) {
        if (e.target.value == "new") {
            console.log(e.target.value)
            newCat = true;
            let cat = document.createElement('input');
            cat.type = "text";
            cat.placeholder = "Nouvelle catégorie";
            cat.id = "new-cat";
            cat.name = "new-cat";
            cat.required = true;
            cat.classList.add('form-input')
            select.parentNode.appendChild(cat);
            select.disabled = true;
            checkChangeInput();

        } else {
            newCat = false;
            if (document.getElementById('new-cat')) {
                document.getElementById('new-cat').remove();
            }
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


    /**
     * Function pour vérifier les inputs
     * @returns 
     */
    function checkInputs() {

        let allInputs;
        if (newCat) {
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

    /**
     * Function pour vérifier les changements des inputs
     */
    function checkChangeInput() {
        let allInputs;
        allInputs = document.querySelectorAll('form#form-create input, form#form-create select');
        for (const input of allInputs) {
            input.addEventListener('change', checkInputs);
        }
    }

    /**
     * Function pour ajouter un work
     */
    btn.addEventListener('click', async function(event) {
        event.preventDefault();
        if (!checkInputs()) {
            return;
        }
        const title = document.getElementById('title').value;
        const file = document.getElementById('file').files[0];
        let categoryId = document.getElementById('categorie').value;
        const token = localStorage.getItem('token');

        if (newCat) {
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
                allCategories.push(res);

                addCat(res)
            }).catch((error) => {
                console.error('Erreur :', error);
                return;
            });
        };
        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', file);
        formData.append('category', categoryId);

        await fetch("http://localhost:5678/api/works", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: formData,
        }).then(async (response) => {
            let succes = document.getElementById('return_add');
            succes.classList.add('green');
            succes.innerText = "Le projet a été ajouté avec succès";
            setTimeout(() => {succes.innerText = "";}, 10000);
            newCat = false;
            let select = document.getElementById('categorie');
            if (document.getElementById('new-cat')) {
                document.getElementById('new-cat').remove();
            };
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
/**
 * Function pour ouvrir & gerer le modal de modification
 * @returns 
 */
const setupModal = async () => {
    const editContainer = document.getElementById("container-edit");
    editContainer.innerText = "";
    if (allWorks.length === 0) {
        editContainer.innerText = "Aucune photo n'est publié";

        return;
    }
    allWorks.forEach((work) => {

        const element = document.createElement("div");
        element.classList.add("box-edt");

        let modalImg = document.createElement('img')
        modalImg.src = work.imageUrl;
        modalImg.alt = work.title;

        let modalSpan = document.createElement('span')
        modalSpan.classList.add('delete-icon');

        let spanModalImg = document.createElement('img');
        spanModalImg.src = "./assets/icons/delete.png";
        spanModalImg.alt = "delete";
        spanModalImg.addEventListener('click', function() {
            deleteWork(work.id);
        });
        modalSpan.appendChild(spanModalImg);
        element.appendChild(modalImg)
        element.appendChild(modalSpan)

        editContainer.appendChild(element); // Ajouter l'élément de travail à la galerie
    });
}


/**
 * Function pour supprimer un work
 * @param {*} id 
 * @returns 
 */
const deleteWork = async (id) => {
    const token = localStorage.getItem('token');
    let p_message = document.getElementById('return_delete');
    if (!allWorks.find((work) => work.id === id)) {
       
        p_message.classList.add('red');
        p_message.innerText = "Une erreur est survenue lors de la suppression du projet";
        setTimeout(() => {p_message.innerText = "";}, 10000);
    
        return;
    }
    await fetch(`http://localhost:5678/api/works/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    }).then(async (response) => {

        if (response.status == 204) {
            let last = allWorks.filter((work) => work.id !== id);
            allWorks = last;
            setupModal()
            setupPages(allWorks);
            p_message.classList.add('green');
            p_message.innerText = "Le projet a été supprimé avec succès";
        } else {
            p_message.classList.add('red');
            p_message.innerText = "Une erreur est survenue lors de la suppression du projet";
        }

        setTimeout(() => {p_message.innerText = "";}, 10000);
    });
}
document.getElementById('edit-close').addEventListener('click', function() {
    window.edit.close();
});
document.getElementById('all-close').addEventListener('click', function() {
    window.create.close();
    window.edit.close();
});
document.getElementById('back-edit').addEventListener('click', function() {
    window.create.close();
    openModal('edit');
});
document.getElementById('open-edit').addEventListener('click', function() {
    openModal('edit');
})
document.getElementById('open-create').addEventListener('click', function() {
    openModal('add');
    window.edit.close()
})
/**
 * Function pour ouvrir un modal défini
 * @param {*} type 
 */
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
/**
 * Gestion du token localStorage
 */
if (localStorage.getItem('token')) {
    document.getElementById('sign').innerText = "logout";
    document.getElementsByClassName('filtres')[0].style.display = "none";
    let all_edit = document.getElementsByClassName('edit-mode');
    for (var i = 0; i < all_edit.length; i++) {
        all_edit[i].style.display = "block";
    }
    let baseHeaders = document.querySelector('header');
    baseHeaders.classList.add('pad-top');


}