let allWorks = [];
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
const setupPages = (works) => {
    const worksContainer = document.querySelector(".gallery");
    worksContainer.innerHTML = "";
    works.forEach((work) => {
        const workElement = document.createElement("figure");
        workElement.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        worksContainer.appendChild(workElement); // Ajouter l'élément de travail à la galerie
    });
};
const filterWorks = (category) => {
    const works = category === 0 ? allWorks : allWorks.filter((work) => work.categoryId === category);
    setupPages(works);
};

getWorks();